import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { RtcService } from "../services/rtc.service.js";
import { FirebaseService } from "../services/firebase.service.js";
import { env } from "../config/env.js";

export const consultationsRouter = Router();

// Test RTC Token generation (Strictly restricted to non-production development environments or Admin)
consultationsRouter.post("/test-rtc", async (req: Request, res: Response) => {
  if (env.NODE_ENV === "production") {
    res.status(403).json({
      success: false,
      error: "ENDPOINT_DISABLED_IN_PRODUCTION",
      message: "The ephemeral RTC test endpoint is disabled in production.",
    });
    return;
  }
  try {
    const { channelName = "test-channel", uid, role = "publisher" } = req.body;
    const tokenData = RtcService.mintToken({
      channelName: String(channelName),
      uid: uid ? Number(uid) : undefined,
      role: role === "subscriber" ? "subscriber" : "publisher",
      expireSeconds: 3600,
    });

    res.json({
      success: true,
      message: "Agora RTC token generated successfully",
      data: tokenData,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "FAILED_TO_GENERATE_RTC_TOKEN",
      message: error?.message || "Failed to generate Agora token",
    });
  }
});

// Customer requests a consultation
consultationsRouter.post("/request", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      astrologerProfileId: z.string().min(1),
      type: z.enum(["CHAT", "AUDIO", "VIDEO"]),
      birthProfileId: z.string().optional(),
      concern: z.string().max(120).optional(),
      preferredLanguage: z.string().max(32).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { astrologerProfileId, type, birthProfileId, concern, preferredLanguage } = parsed.data;
    const customerId = req.user!.id;

    // Check astrologer exists and is verified
    const astrologer = await prisma.astrologerProfile.findUnique({
      where: { id: astrologerProfileId },
      include: { user: true },
    });

    if (!astrologer) {
      res.status(404).json({ success: false, error: "ASTROLOGER_NOT_FOUND", message: "Astrologer not found" });
      return;
    }

    if (astrologer.verificationStage !== "APPROVED" && astrologer.verificationStage !== "ACTIVE") {
      res.status(400).json({ success: false, error: "ASTROLOGER_NOT_AVAILABLE", message: "Astrologer is not approved for live consultations" });
      return;
    }

    // Check consultation type is enabled
    if (type === "CHAT" && !astrologer.chatEnabled) {
      res.status(400).json({ success: false, error: "SERVICE_NOT_SUPPORTED", message: "Chat consultation is currently disabled for this astrologer" });
      return;
    }
    if (type === "AUDIO" && !astrologer.audioEnabled) {
      res.status(400).json({ success: false, error: "SERVICE_NOT_SUPPORTED", message: "Audio consultation is currently disabled for this astrologer" });
      return;
    }
    if (type === "VIDEO" && !astrologer.videoEnabled) {
      res.status(400).json({ success: false, error: "SERVICE_NOT_SUPPORTED", message: "Video consultation is currently disabled for this astrologer" });
      return;
    }

    // Determine rate
    let ratePaise = astrologer.chatRatePaise;
    if (type === "AUDIO") ratePaise = astrologer.audioRatePaise;
    if (type === "VIDEO") ratePaise = astrologer.videoRatePaise;

    // Check customer wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    const totalBalancePaise = (wallet?.paidBalancePaise || 0n) + (wallet?.promoBalancePaise || 0n);
    if (totalBalancePaise < BigInt(ratePaise)) {
      res.status(402).json({
        success: false,
        error: "INSUFFICIENT_BALANCE",
        message: `Insufficient wallet balance. Minimum ₹${(ratePaise / 100).toFixed(2)} required for 1 minute of ${type.toLowerCase()} consultation.`,
        requiredPaise: ratePaise,
        availablePaise: Number(totalBalancePaise),
      });
      return;
    }

    // Create consultation request with 30s timeout
    const expiresAt = new Date(Date.now() + 30 * 1000);
    const consultation = await prisma.consultationRequest.create({
      data: {
        customerId,
        astrologerProfileId,
        birthProfileId,
        type,
        status: "PENDING",
        ratePaisePerMinute: ratePaise,
        concern: concern || "General Vedic Consultation",
        preferredLanguage: preferredLanguage || "en",
        expiresAt,
      },
    });

    const channelName = RtcService.getChannelName(consultation.id);
    await prisma.consultationRequest.update({
      where: { id: consultation.id },
      data: { channelName },
    });

    // Notify astrologer via push notification and DB record
    await FirebaseService.sendPush({
      userId: astrologer.userId,
      category: "INCOMING_CONSULTATION",
      title: `Incoming ${type} Consultation Request`,
      body: `${req.user?.fullName || "A customer"} has requested a ${type} consultation (${concern || "General inquiry"}).`,
      actionUrl: `/partner?tab=requests&consultationId=${consultation.id}`,
      data: {
        consultationId: consultation.id,
        type,
        ratePaisePerMinute: String(ratePaise),
      },
    });

    const maxDurationMinutes = Math.floor(Number(totalBalancePaise) / ratePaise);
    const maxDurationSeconds = maxDurationMinutes * 60;

    // Create Consultation Hold on customer wallet
    await prisma.consultationHold.create({
      data: {
        consultationId: consultation.id,
        customerId,
        ratePaisePerMinute: ratePaise,
        heldAmountPaise: BigInt(ratePaise * Math.min(maxDurationMinutes, 5)),
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      success: true,
      message: "Consultation request sent successfully. Waiting for astrologer to accept.",
      data: {
        consultationId: consultation.id,
        channelName,
        type,
        ratePaisePerMinute: ratePaise,
        expiresAt,
        timeoutSeconds: 30,
        maxDurationSeconds,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to create consultation request" });
  }
});

// Astrologer accepts consultation
consultationsRouter.post("/:id/accept", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user!.id;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: {
        astrologerProfile: true,
        customer: true,
      },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Consultation not found" });
      return;
    }

    if (consultation.astrologerProfile.userId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the requested astrologer can accept this consultation" });
      return;
    }

    if (consultation.status !== "PENDING" && consultation.status !== "INITIATED") {
      res.status(400).json({ success: false, error: "INVALID_STATE", message: `Consultation is already ${consultation.status}` });
      return;
    }

    // Atomic update to ACCEPTED
    const channelName = consultation.channelName || RtcService.getChannelName(consultation.id);
    const updated = await prisma.consultationRequest.update({
      where: { id: consultationId },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        channelName,
      },
    });

    // Mark astrologer BUSY
    await prisma.astrologerProfile.update({
      where: { id: consultation.astrologerProfileId },
      data: { availabilityStatus: "BUSY" },
    });

    // Mint RTC token for astrologer
    const rtcToken = RtcService.mintToken({
      channelName,
      uid: userId,
      role: "publisher",
    });

    // Notify customer via push notification
    await FirebaseService.sendPush({
      userId: consultation.customerId,
      category: "CONSULTATION_ACCEPTED",
      title: "Consultation Accepted!",
      body: `${consultation.astrologerProfile.displayName} accepted your consultation. Joining room now.`,
      actionUrl: `/consultation/call?id=${consultation.id}`,
      data: {
        consultationId: consultation.id,
        channelName,
      },
    });

    res.json({
      success: true,
      message: "Consultation accepted",
      data: {
        consultationId: updated.id,
        status: "ACCEPTED",
        channelName,
        rtcToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to accept consultation" });
  }
});

// Astrologer rejects consultation
consultationsRouter.post("/:id/reject", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user!.id;
    const { reason = "Astrologer is currently unavailable" } = req.body;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Consultation not found" });
      return;
    }

    if (consultation.astrologerProfile.userId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the requested astrologer can reject this consultation" });
      return;
    }

    await prisma.consultationRequest.update({
      where: { id: consultationId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Ensure astrologer status is ONLINE
    await prisma.astrologerProfile.update({
      where: { id: consultation.astrologerProfileId },
      data: { availabilityStatus: "ONLINE" },
    });

    // Notify customer via push notification
    await FirebaseService.sendPush({
      userId: consultation.customerId,
      category: "CONSULTATION_REJECTED",
      title: "Consultation Unavailable",
      body: `${consultation.astrologerProfile.displayName} was unable to accept. No money was deducted.`,
      actionUrl: "/astrologers",
    });

    res.json({ success: true, message: "Consultation rejected successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to reject consultation" });
  }
});

// Get/Refresh Agora RTC Token for active consultation
consultationsRouter.post("/:id/rtc-token", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user!.id;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Consultation not found" });
      return;
    }

    const isCustomer = consultation.customerId === userId;
    const isAstrologer = consultation.astrologerProfile.userId === userId;

    if (!isCustomer && !isAstrologer) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Not a participant in this consultation" });
      return;
    }

    if (["COMPLETED", "ENDED", "CANCELLED", "REJECTED", "EXPIRED"].includes(consultation.status)) {
      res.status(400).json({
        success: false,
        error: "CONSULTATION_INACTIVE",
        message: `Cannot issue RTC token for a consultation with status ${consultation.status}`,
      });
      return;
    }

    const channelName = consultation.channelName || RtcService.getChannelName(consultation.id);
    const tokenData = RtcService.mintToken({
      channelName,
      uid: userId,
      role: "publisher",
      expireSeconds: 3600,
    });

    res.json({
      success: true,
      data: {
        consultationId: consultation.id,
        channelName,
        type: consultation.type,
        userRole: isAstrologer ? "ASTROLOGER" : "CUSTOMER",
        ...tokenData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to mint token" });
  }
});

// End consultation
consultationsRouter.post("/:id/end", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user!.id;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Consultation not found" });
      return;
    }

    const isCustomer = consultation.customerId === userId;
    const isAstrologer = consultation.astrologerProfile.userId === userId;

    if (!isCustomer && !isAstrologer) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Not a participant in this consultation" });
      return;
    }

    if (["COMPLETED", "ENDED", "CANCELLED", "REJECTED", "EXPIRED"].includes(consultation.status)) {
      res.status(400).json({
        success: false,
        error: "CONSULTATION_INACTIVE",
        message: `Cannot issue RTC token for a consultation with status ${consultation.status}`,
      });
      return;
    }

    const reportedDuration = req.body?.durationSeconds !== undefined ? Number(req.body.durationSeconds) : null;
    const durationSeconds = reportedDuration !== null && !isNaN(reportedDuration) && reportedDuration >= 0
      ? reportedDuration
      : consultation.acceptedAt
      ? Math.max(1, Math.floor((Date.now() - consultation.acceptedAt.getTime()) / 1000))
      : 60;

    const billableMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const ratePaise = consultation.ratePaisePerMinute;
    const totalChargePaise = BigInt(billableMinutes * ratePaise);

    // Atomic financial settlement transaction
    const settlement = await prisma.$transaction(async (tx) => {
      // 1. Update consultation
      await tx.consultationRequest.update({
        where: { id: consultationId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          durationSeconds,
        },
      });

      // 2. Fetch customer wallet
      let customerWallet = await tx.wallet.findUnique({
        where: { userId: consultation.customerId },
      });

      if (!customerWallet) {
        customerWallet = await tx.wallet.create({
          data: {
            userId: consultation.customerId,
            currency: "INR",
            paidBalancePaise: 0n,
            promoBalancePaise: 0n,
          },
        });
      }

      // 3. Deduct from promo first, then paid
      let remainingToDeduct = totalChargePaise;
      let promoDeduction = 0n;
      let paidDeduction = 0n;

      if (customerWallet.promoBalancePaise >= remainingToDeduct) {
        promoDeduction = remainingToDeduct;
        remainingToDeduct = 0n;
      } else {
        promoDeduction = customerWallet.promoBalancePaise;
        remainingToDeduct -= promoDeduction;
      }

      if (customerWallet.paidBalancePaise >= remainingToDeduct) {
        paidDeduction = remainingToDeduct;
        remainingToDeduct = 0n;
      } else {
        paidDeduction = customerWallet.paidBalancePaise;
        remainingToDeduct = 0n;
      }

      const totalDeducted = promoDeduction + paidDeduction;
      const newCustomerPaid = customerWallet.paidBalancePaise - paidDeduction;
      const newCustomerPromo = customerWallet.promoBalancePaise - promoDeduction;

      await tx.wallet.update({
        where: { id: customerWallet.id },
        data: {
          paidBalancePaise: newCustomerPaid,
          promoBalancePaise: newCustomerPromo,
          version: { increment: 1 },
        },
      });

      // 4. Double-entry transaction for customer
      const customerTxIdempotency = `CONSULT-${consultation.id}-${Date.now()}`;
      await tx.walletTransaction.create({
        data: {
          walletId: customerWallet.id,
          idempotencyKey: customerTxIdempotency,
          type: "CONSULTATION_DEBIT",
          amountPaise: totalDeducted,
          balanceAfterPaise: newCustomerPaid + newCustomerPromo,
          referenceType: "CONSULTATION",
          referenceId: consultation.id,
          description: `${consultation.type} consultation with ${consultation.astrologerProfile.displayName} (${billableMinutes} mins)`,
          metadataJson: {
            durationSeconds,
            billableMinutes,
            ratePaisePerMinute: ratePaise,
            paidDeduction: Number(paidDeduction),
            promoDeduction: Number(promoDeduction),
          },
        },
      });

      // 5. Credit astrologer partner share (80% net after 20% platform commission)
      const astrologerEarningPaise = BigInt(Math.round(Number(totalDeducted) * 0.80));
      let astrologerWallet = await tx.wallet.findUnique({
        where: { userId: consultation.astrologerProfile.userId },
      });

      if (!astrologerWallet) {
        astrologerWallet = await tx.wallet.create({
          data: {
            userId: consultation.astrologerProfile.userId,
            currency: "INR",
            paidBalancePaise: 0n,
            promoBalancePaise: 0n,
          },
        });
      }

      const newAstrologerBalance = astrologerWallet.paidBalancePaise + astrologerEarningPaise;
      await tx.wallet.update({
        where: { id: astrologerWallet.id },
        data: {
          paidBalancePaise: newAstrologerBalance,
          version: { increment: 1 },
        },
      });

      const astrologerTxIdempotency = `EARN-${consultation.id}-${Date.now()}`;
      await tx.walletTransaction.create({
        data: {
          walletId: astrologerWallet.id,
          idempotencyKey: astrologerTxIdempotency,
          type: "WALLET_RECHARGE",
          amountPaise: astrologerEarningPaise,
          balanceAfterPaise: newAstrologerBalance,
          referenceType: "CONSULTATION_EARNING",
          referenceId: consultation.id,
          description: `Earnings for ${consultation.type} consultation #${consultation.id.slice(-6)} (${billableMinutes} mins)`,
        },
      });

      // 6. Settle ConsultationHold
      await tx.consultationHold.updateMany({
        where: { consultationId: consultation.id },
        data: {
          status: "SETTLED",
          settledAmountPaise: totalDeducted,
          settledAt: new Date(),
        },
      });

      // 7. Reset astrologer status to ONLINE
      await tx.astrologerProfile.update({
        where: { id: consultation.astrologerProfileId },
        data: { availabilityStatus: "ONLINE" },
      });

      return {
        consultationId,
        durationSeconds,
        billableMinutes,
        totalChargeInr: Number(totalDeducted) / 100,
        customerRemainingBalanceInr: Number(newCustomerPaid + newCustomerPromo) / 100,
        astrologerEarningInr: Number(astrologerEarningPaise) / 100,
      };
    });

    res.json({
      success: true,
      message: "Consultation completed and settled successfully",
      data: settlement,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to end consultation" });
  }
});
