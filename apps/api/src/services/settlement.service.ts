import { prisma } from "../db.js";
import { EarningsService } from "./earnings.service.js";

export class SettlementService {
  /**
   * Generate an automated settlement batch from all currently APPROVED withdrawal requests
   */
  static async generateBatch(params?: {
    scheduleType?: string;
    approvedByUserId?: string;
    notes?: string;
  }) {
    const scheduleType = params?.scheduleType || "MANUAL";

    // Find all approved withdrawal requests not yet part of any active batch item
    const approvedWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        astrologerProfile: {
          include: {
            bankAccount: true,
            user: { select: { fullName: true, email: true, phoneE164: true } },
          },
        },
      },
    });

    if (approvedWithdrawals.length === 0) {
      throw new Error("NO_APPROVED_WITHDRAWALS_PENDING");
    }

    const batchNumber = `SETTLE-BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100 + Math.random() * 900)}`;

    let totalAmountPaise = 0n;
    const uniqueAstrologers = new Set<string>();

    for (const w of approvedWithdrawals) {
      totalAmountPaise += w.netAmountPaise || w.amountPaise;
      uniqueAstrologers.add(w.astrologerProfileId);
    }

    const batch = await prisma.$transaction(async (tx) => {
      const newBatch = await tx.settlementBatch.create({
        data: {
          batchNumber,
          status: "READY_FOR_PAYOUT",
          scheduleType,
          totalAmountPaise,
          totalAstrologers: uniqueAstrologers.size,
          approvedByUserId: params?.approvedByUserId || null,
          notes: params?.notes || `Automated batch created for ${approvedWithdrawals.length} approved withdrawal requests`,
        },
      });

      // Create settlement items for each withdrawal
      for (const w of approvedWithdrawals) {
        await tx.settlementItem.create({
          data: {
            batchId: newBatch.id,
            astrologerProfileId: w.astrologerProfileId,
            withdrawalRequestId: w.id,
            grossAmountPaise: w.amountPaise,
            tdsAmountPaise: w.tdsAmountPaise,
            processingFeePaise: w.processingFeePaise,
            netAmountPaise: w.netAmountPaise || w.amountPaise,
            payoutMethod: "IMPS",
            status: "QUEUED",
          },
        });

        // Mark withdrawal as PROCESSING
        await tx.withdrawalRequest.update({
          where: { id: w.id },
          data: { status: "PROCESSING" },
        });
      }

      return newBatch;
    });

    return prisma.settlementBatch.findUnique({
      where: { id: batch.id },
      include: { items: true },
    });
  }

  /**
   * Execute or simulate the payout of a settlement batch (e.g., via RazorpayX or Bank IMPS/NEFT)
   */
  static async executeBatchPayout(params: {
    batchId: string;
    processedByUserId?: string;
  }) {
    const { batchId, processedByUserId } = params;

    const batch = await prisma.settlementBatch.findUniqueOrThrow({
      where: { id: batchId },
      include: {
        items: true,
      },
    });

    if (batch.status === "COMPLETED") {
      return batch; // Idempotent
    }

    const payoutReference = `RZPX_PAYOUT_${Date.now()}`;
    const timestamp = Date.now();

    // Process each item
    for (let i = 0; i < batch.items.length; i++) {
      const item = batch.items[i];
      const utr = `UTR${timestamp.toString().slice(-6)}${String(i + 1).padStart(4, "0")}`;

      await prisma.$transaction(async (tx) => {
        // Update settlement item
        await tx.settlementItem.update({
          where: { id: item.id },
          data: {
            status: "SUCCESS",
            utrReference: utr,
            processedAt: new Date(),
          },
        });
      });

      // Settle withdrawal in earnings service if withdrawal request linked
      if (item.withdrawalRequestId) {
        await EarningsService.settleWithdrawalPaid({
          withdrawalId: item.withdrawalRequestId,
          utrNumber: utr,
          processedByUserId,
        });
      }
    }

    // Mark batch completed
    return prisma.settlementBatch.update({
      where: { id: batchId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        payoutReference,
      },
      include: { items: true },
    });
  }

  /**
   * Export settlement batch data as standard CSV format for banking portal upload
   */
  static async exportBatchCsv(batchId: string): Promise<string> {
    const batch = await prisma.settlementBatch.findUniqueOrThrow({
      where: { id: batchId },
      include: {
        items: true,
      },
    });

    const headers = [
      "Settlement Item ID",
      "Astrologer Profile ID",
      "Withdrawal Request ID",
      "Gross Amount (INR)",
      "TDS Deducted (INR)",
      "Processing Fee (INR)",
      "Net Payable (INR)",
      "Payout Method",
      "UTR Reference",
      "Status",
    ];

    const rows = batch.items.map((it) => [
      it.id,
      it.astrologerProfileId,
      it.withdrawalRequestId || "N/A",
      (Number(it.grossAmountPaise) / 100).toFixed(2),
      (Number(it.tdsAmountPaise) / 100).toFixed(2),
      (Number(it.processingFeePaise) / 100).toFixed(2),
      (Number(it.netAmountPaise) / 100).toFixed(2),
      it.payoutMethod,
      it.utrReference || "PENDING",
      it.status,
    ]);

    return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  }
}
