import { prisma } from "../db.js";
import { FirebaseService } from "./firebase.service.js";

export interface SettlementResult {
  consultationId: string;
  totalDurationSeconds: number;
  billableMinutes: number;
  ratePaisePerMinute: number;
  totalCostPaise: bigint;
  promoDeductedPaise: bigint;
  paidDeductedPaise: bigint;
  astrologerEarningsPaise: bigint;
  platformCommissionPaise: bigint;
  newCustomerBalanceInr: number;
  newAstrologerBalanceInr: number;
  alreadySettled?: boolean;
}

export class BillingService {
  /**
   * Authoritative State Transition Tracker with Audit Logging
   */
  static async recordStateTransition(
    consultationId: string,
    fromState: string | null,
    toState: string,
    reason?: string,
    metadataJson?: any
  ): Promise<void> {
    try {
      await prisma.consultationStateHistory.create({
        data: {
          consultationId,
          fromState,
          toState,
          reason: reason || null,
          metadataJson: metadataJson || null,
        },
      });
    } catch (err) {
      console.warn("[BillingService] Failed to log state transition:", err);
    }
  }

  /**
   * Authoritative Billable Cost Calculation (Per-minute ceiling with free promotional discount support)
   */
  static calculateCost(
    durationSeconds: number,
    ratePaisePerMinute: number,
    freeMinutes: number = 0
  ): {
    billableMinutes: number;
    effectiveMinutes: number;
    totalCostPaise: bigint;
  } {
    if (durationSeconds <= 0) {
      return { billableMinutes: 0, effectiveMinutes: 0, totalCostPaise: 0n };
    }
    const billableMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const effectiveMinutes = Math.max(0, billableMinutes - freeMinutes);
    const totalCostPaise = BigInt(effectiveMinutes * ratePaisePerMinute);
    return { billableMinutes, effectiveMinutes, totalCostPaise };
  }

  /**
   * Idempotent Atomic Settlement & Double-Entry Financial Ledger
   */
  static async settleConsultation(params: {
    consultationId: string;
    durationSeconds: number;
    endedByUserId?: string;
    reason?: string;
  }): Promise<SettlementResult> {
    const { consultationId, durationSeconds, endedByUserId, reason } = params;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: {
        astrologerProfile: { include: { user: true } },
        customer: true,
        billingRecord: true,
      },
    });

    if (!consultation) {
      throw new Error("CONSULTATION_NOT_FOUND");
    }

    // Idempotency: If already completed and settled, return existing billing record
    if (consultation.status === "COMPLETED" && consultation.billingRecord) {
      const customerWallet = await prisma.wallet.findUnique({ where: { userId: consultation.customerId } });
      const astWallet = await prisma.wallet.findUnique({ where: { userId: consultation.astrologerProfile.userId } });

      return {
        consultationId,
        totalDurationSeconds: consultation.billingRecord.totalDurationSeconds,
        billableMinutes: consultation.billingRecord.billableMinutes,
        ratePaisePerMinute: consultation.billingRecord.ratePaisePerMinute,
        totalCostPaise: consultation.billingRecord.totalAmountPaise,
        promoDeductedPaise: consultation.billingRecord.promoAmountPaise,
        paidDeductedPaise: consultation.billingRecord.paidAmountPaise,
        astrologerEarningsPaise: consultation.billingRecord.astrologerEarningsPaise,
        platformCommissionPaise: consultation.billingRecord.platformCommissionPaise,
        newCustomerBalanceInr: Number((customerWallet?.paidBalancePaise || 0n) + (customerWallet?.promoBalancePaise || 0n)) / 100,
        newAstrologerBalanceInr: Number((astWallet?.paidBalancePaise || 0n) + (astWallet?.promoBalancePaise || 0n)) / 100,
        alreadySettled: true,
      };
    }

    const { billableMinutes, totalCostPaise } = this.calculateCost(
      durationSeconds,
      consultation.ratePaisePerMinute
    );

    const commissionPercent = 20; // 20% platform commission
    const astrologerEarningsPaise = (totalCostPaise * 80n) / 100n;
    const platformCommissionPaise = totalCostPaise - astrologerEarningsPaise;

    let promoDeducted = 0n;
    let paidDeducted = 0n;
    let finalCustBalance = 0n;
    let finalAstBalance = 0n;

    await prisma.$transaction(async (tx) => {
      // 1. Fetch & lock customer wallet
      const customerWallet = await tx.wallet.findUniqueOrThrow({
        where: { userId: consultation.customerId },
      });

      let remainingToDeduct = totalCostPaise;

      // Promo balance priority consumption
      if (customerWallet.promoBalancePaise > 0n) {
        if (customerWallet.promoBalancePaise >= remainingToDeduct) {
          promoDeducted = remainingToDeduct;
          remainingToDeduct = 0n;
        } else {
          promoDeducted = customerWallet.promoBalancePaise;
          remainingToDeduct -= promoDeducted;
        }
      }

      // Remaining from paid balance
      if (remainingToDeduct > 0n) {
        paidDeducted = remainingToDeduct;
      }

      const newPromo = customerWallet.promoBalancePaise - promoDeducted;
      const newPaid = customerWallet.paidBalancePaise - paidDeducted;
      finalCustBalance = newPromo + newPaid;

      // Update customer wallet
      await tx.wallet.update({
        where: { id: customerWallet.id },
        data: {
          promoBalancePaise: newPromo >= 0n ? newPromo : 0n,
          paidBalancePaise: newPaid >= 0n ? newPaid : 0n,
        },
      });

      // Customer double-entry ledger record
      await tx.walletTransaction.create({
        data: {
          walletId: customerWallet.id,
          idempotencyKey: `consultation_debit_${consultationId}_${Date.now()}`,
          type: "CONSULTATION_DEBIT",
          amountPaise: totalCostPaise,
          balanceAfterPaise: finalCustBalance,
          referenceType: "CONSULTATION",
          referenceId: consultationId,
          description: `${consultation.type} consultation (${billableMinutes} min @ ₹${(consultation.ratePaisePerMinute / 100).toFixed(2)}/min)`,
          metadataJson: {
            durationSeconds,
            billableMinutes,
            promoDeducted: promoDeducted.toString(),
            paidDeducted: paidDeducted.toString(),
          },
        },
      });

      // 2. Fetch & credit astrologer wallet
      const astUserId = consultation.astrologerProfile.userId;
      let astWallet = await tx.wallet.findUnique({ where: { userId: astUserId } });
      if (!astWallet) {
        astWallet = await tx.wallet.create({
          data: { userId: astUserId, paidBalancePaise: 0n, promoBalancePaise: 0n },
        });
      }

      const astNewPaid = astWallet.paidBalancePaise + astrologerEarningsPaise;
      finalAstBalance = astNewPaid + astWallet.promoBalancePaise;

      await tx.wallet.update({
        where: { id: astWallet.id },
        data: { paidBalancePaise: astNewPaid },
      });

      // Astrologer double-entry ledger record
      await tx.walletTransaction.create({
        data: {
          walletId: astWallet.id,
          idempotencyKey: `consultation_credit_${consultationId}_${Date.now()}`,
          type: "WALLET_RECHARGE",
          amountPaise: astrologerEarningsPaise,
          balanceAfterPaise: finalAstBalance,
          referenceType: "CONSULTATION_EARNING",
          referenceId: consultationId,
          description: `Earnings for ${consultation.type} consultation (${billableMinutes} min @ 80% share)`,
          metadataJson: {
            durationSeconds,
            billableMinutes,
            totalGrossPaise: totalCostPaise.toString(),
            netEarningsPaise: astrologerEarningsPaise.toString(),
            platformCommissionPaise: platformCommissionPaise.toString(),
          },
        },
      });

      // 3. Settle hold
      await tx.consultationHold.updateMany({
        where: { consultationId },
        data: {
          status: "SETTLED",
          settledAmountPaise: totalCostPaise,
          settledAt: new Date(),
        },
      });

      // 4. Create persistent billing record
      await tx.consultationBillingRecord.create({
        data: {
          consultationId,
          totalDurationSeconds: durationSeconds,
          billableMinutes,
          ratePaisePerMinute: consultation.ratePaisePerMinute,
          totalAmountPaise: totalCostPaise,
          promoAmountPaise: promoDeducted,
          paidAmountPaise: paidDeducted,
          astrologerEarningsPaise,
          platformCommissionPaise,
        },
      });

      // 5. Update consultation status
      await tx.consultationRequest.update({
        where: { id: consultationId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          durationSeconds,
        },
      });

      // 6. Reset astrologer status to ONLINE
      await tx.astrologerProfile.update({
        where: { id: consultation.astrologerProfileId },
        data: { availabilityStatus: "ONLINE" },
      });

      // 7. Audit log transition
      await tx.consultationStateHistory.create({
        data: {
          consultationId,
          fromState: consultation.status,
          toState: "COMPLETED",
          reason: reason || (endedByUserId ? `Ended by user ${endedByUserId}` : "Completed"),
          metadataJson: {
            billableMinutes,
            totalCostPaise: totalCostPaise.toString(),
            astrologerEarningsPaise: astrologerEarningsPaise.toString(),
          },
        },
      });
    });

    // Notify participants of completion
    await FirebaseService.sendPush({
      userId: consultation.customerId,
      category: "CONSULTATION_COMPLETED",
      title: "Consultation Completed",
      body: `Your consultation with ${consultation.astrologerProfile.displayName} has ended. Charged: ₹${(Number(totalCostPaise) / 100).toFixed(2)}.`,
      actionUrl: `/consultation/history?id=${consultationId}`,
      data: { consultationId, billableMinutes: String(billableMinutes) },
    });

    return {
      consultationId,
      totalDurationSeconds: durationSeconds,
      billableMinutes,
      ratePaisePerMinute: consultation.ratePaisePerMinute,
      totalCostPaise,
      promoDeductedPaise: promoDeducted,
      paidDeductedPaise: paidDeducted,
      astrologerEarningsPaise,
      platformCommissionPaise,
      newCustomerBalanceInr: Number(finalCustBalance) / 100,
      newAstrologerBalanceInr: Number(finalAstBalance) / 100,
    };
  }

  /**
   * Release hold and cancel/reject consultation without charges
   */
  static async releaseAndCancel(params: {
    consultationId: string;
    toState: "REJECTED" | "CANCELLED" | "EXPIRED" | "FAILED";
    reason?: string;
  }): Promise<void> {
    const { consultationId, toState, reason } = params;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) return;

    await prisma.$transaction(async (tx) => {
      // 1. Release hold
      await tx.consultationHold.updateMany({
        where: { consultationId },
        data: {
          status: "RELEASED",
          settledAt: new Date(),
        },
      });

      // 2. Update consultation status
      await tx.consultationRequest.update({
        where: { id: consultationId },
        data: {
          status: toState,
          rejectionReason: reason || null,
          endedAt: new Date(),
        },
      });

      // 3. Reset astrologer to ONLINE if they were marked BUSY
      await tx.astrologerProfile.update({
        where: { id: consultation.astrologerProfileId },
        data: { availabilityStatus: "ONLINE" },
      });

      // 4. Audit log
      await tx.consultationStateHistory.create({
        data: {
          consultationId,
          fromState: consultation.status,
          toState,
          reason: reason || `Consultation ${toState.toLowerCase()}`,
        },
      });
    });
  }
}
