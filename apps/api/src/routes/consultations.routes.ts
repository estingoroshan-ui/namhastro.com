import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { RtcService } from "../services/rtc.service.js";
import { FirebaseService } from "../services/firebase.service.js";
import { BillingService } from "../services/billing.service.js";
import {
  emitToUser,
  emitToConsultation,
  startConsultationTimer,
  stopConsultationTimer,
} from "../services/socket.service.js";
import { env } from "../config/env.js";

export const consultationsRouter = Router();

// 1. Ephemeral Test RTC Token (dev only)
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

// 2. Customer requests a consultation (CHAT, AUDIO, VIDEO)
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
      res.status(400).json({
        success: false,
        error: "ASTROLOGER_NOT_AVAILABLE",
        message: "Astrologer is not approved for live consultations",
      });
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

    // Record state transition
    await BillingService.recordStateTransition(consultation.id, "CREATED", "PENDING", "Consultation requested by customer");

    // Real-time Socket.IO dispatch to astrologer's private room
    emitToUser(astrologer.userId, "consultation:incoming", {
      consultationId: consultation.id,
      customerName: req.user?.fullName || "Valued Customer",
      birthProfileId,
      concern: consultation.concern,
      preferredLanguage: consultation.preferredLanguage,
      type,
      ratePaisePerMinute: ratePaise,
      expiresAt: expiresAt.toISOString(),
      timeoutSeconds: 30,
    });

    // Notify astrologer via Firebase push notification
    FirebaseService.sendPush({
      userId: astrologer.userId,
      category: "INCOMING_CONSULTATION",
      title: `Incoming ${type} Consultation Request`,
      body: `${req.user?.fullName || "A customer"} requested a ${type} consultation (${concern || "General inquiry"}).`,
      actionUrl: `/partner?tab=requests&consultationId=${consultation.id}`,
      data: {
        consultationId: consultation.id,
        type,
        ratePaisePerMinute: String(ratePaise),
      },
    }).catch(() => {});

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

// 3. Astrologer accepts consultation
consultationsRouter.post("/:id/accept", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.id);
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

    // Record state transition
    await BillingService.recordStateTransition(consultationId, consultation.status, "ACCEPTED", "Accepted by astrologer");

    // Mint RTC token for astrologer
    const rtcToken = RtcService.mintToken({
      channelName,
      uid: userId,
      role: "publisher",
    });

    // Calculate maximum duration based on customer wallet
    const customerWallet = await prisma.wallet.findUnique({ where: { userId: consultation.customerId } });
    const totalPaise = (customerWallet?.paidBalancePaise || 0n) + (customerWallet?.promoBalancePaise || 0n);
    const maxDurationSeconds = Math.max(60, Math.floor(Number(totalPaise) / consultation.ratePaisePerMinute) * 60);

    // Start server-authoritative billing timer
    startConsultationTimer({
      consultationId,
      customerId: consultation.customerId,
      astrologerUserId: userId,
      ratePaisePerMinute: consultation.ratePaisePerMinute,
      maxDurationSeconds,
    });

    // Real-time socket dispatch to customer
    emitToUser(consultation.customerId, "consultation:accepted", {
      consultationId: consultation.id,
      channelName,
      rtcToken: RtcService.mintToken({ channelName, uid: consultation.customerId, role: "publisher" }),
      astrologerName: consultation.astrologerProfile.displayName,
      ratePaisePerMinute: consultation.ratePaisePerMinute,
      maxDurationSeconds,
    });

    // Notify customer via push notification
    FirebaseService.sendPush({
      userId: consultation.customerId,
      category: "CONSULTATION_ACCEPTED",
      title: "Consultation Accepted!",
      body: `${consultation.astrologerProfile.displayName} accepted your consultation. Joining room now.`,
      actionUrl: `/consultation/chat?id=${consultation.id}`,
      data: {
        consultationId: consultation.id,
        channelName,
      },
    }).catch(() => {});

    res.json({
      success: true,
      message: "Consultation accepted",
      data: {
        consultationId: updated.id,
        status: "ACCEPTED",
        channelName,
        rtcToken,
        maxDurationSeconds,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to accept consultation" });
  }
});

// 4. Astrologer rejects consultation
consultationsRouter.post("/:id/reject", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.id);
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

    stopConsultationTimer(consultationId);

    // Release hold and update status without charge
    await BillingService.releaseAndCancel({
      consultationId,
      toState: "REJECTED",
      reason,
    });

    // Real-time socket event to customer
    emitToUser(consultation.customerId, "consultation:rejected", {
      consultationId,
      reason,
    });

    // Notify customer via push notification
    FirebaseService.sendPush({
      userId: consultation.customerId,
      category: "CONSULTATION_REJECTED",
      title: "Consultation Unavailable",
      body: `${consultation.astrologerProfile.displayName} was unable to accept. No money was deducted.`,
      actionUrl: "/astrologers",
    }).catch(() => {});

    res.json({ success: true, message: "Consultation rejected successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to reject consultation" });
  }
});

// 5. Customer cancels waiting consultation request
consultationsRouter.post("/:id/cancel", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.id);
    const userId = req.user!.id;
    const { reason = "Cancelled by customer" } = req.body;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Consultation not found" });
      return;
    }

    if (consultation.customerId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the customer can cancel this request" });
      return;
    }

    if (consultation.status !== "PENDING" && consultation.status !== "INITIATED") {
      res.status(400).json({ success: false, error: "CANNOT_CANCEL", message: `Consultation is already ${consultation.status}` });
      return;
    }

    stopConsultationTimer(consultationId);

    // Release hold
    await BillingService.releaseAndCancel({
      consultationId,
      toState: "CANCELLED",
      reason,
    });

    // Notify astrologer via socket
    emitToUser(consultation.astrologerProfile.userId, "consultation:cancelled", {
      consultationId,
      reason,
    });

    res.json({ success: true, message: "Consultation cancelled successfully. Wallet hold released." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to cancel consultation" });
  }
});

// 6. Get/Refresh Agora RTC Token for active consultation
consultationsRouter.post("/:id/rtc-token", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.id);
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
        type: consultation.type,
        userRole: isAstrologer ? "ASTROLOGER" : "CUSTOMER",
        ...tokenData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to mint token" });
  }
});

// 7. End consultation and perform atomic double-entry settlement
consultationsRouter.post("/:id/end", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.id);
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
        message: `Consultation is already ${consultation.status}`,
      });
      return;
    }

    stopConsultationTimer(consultationId);

    const reportedDuration = req.body?.durationSeconds !== undefined ? Number(req.body.durationSeconds) : null;
    const durationSeconds = reportedDuration !== null && !isNaN(reportedDuration) && reportedDuration >= 0
      ? reportedDuration
      : consultation.acceptedAt
      ? Math.max(1, Math.floor((Date.now() - consultation.acceptedAt.getTime()) / 1000))
      : 60;

    // Execute atomic settlement via BillingService
    const settlement = await BillingService.settleConsultation({
      consultationId,
      durationSeconds,
      endedByUserId: userId,
      reason: req.body?.reason || "Ended by participant",
    });

    const responsePayload = {
      consultationId,
      durationSeconds: settlement.totalDurationSeconds,
      billableMinutes: settlement.billableMinutes,
      totalChargeInr: Number(settlement.totalCostPaise) / 100,
      customerRemainingBalanceInr: settlement.newCustomerBalanceInr,
      astrologerEarningInr: Number(settlement.astrologerEarningsPaise) / 100,
    };

    // Broadcast session completion to both participants via socket
    emitToConsultation(consultationId, "consultation:ended", {
      consultationId,
      reason: "CONSULTATION_COMPLETED",
      settlement: responsePayload,
    });

    res.json({
      success: true,
      message: "Consultation completed and settled successfully",
      data: responsePayload,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to end consultation" });
  }
});

// 8. Consultation History with comprehensive filtering
consultationsRouter.get("/history", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    const { status, type, timeRange, limit = "20", page = "1" } = req.query;

    const where: any = {};

    if (role === "ASTROLOGER") {
      const astProfile = await prisma.astrologerProfile.findUnique({ where: { userId } });
      if (!astProfile) {
        res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
        return;
      }
      where.astrologerProfileId = astProfile.id;
    } else if (role !== "SUPER_ADMIN" && role !== "SUPPORT") {
      where.customerId = userId;
    }

    if (status && typeof status === "string") {
      where.status = status;
    }
    if (type && typeof type === "string") {
      where.type = type;
    }

    if (timeRange && typeof timeRange === "string") {
      const now = new Date();
      if (timeRange === "today") {
        where.createdAt = { gte: new Date(now.setHours(0, 0, 0, 0)) };
      } else if (timeRange === "7d") {
        where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (timeRange === "30d") {
        where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    const take = Math.min(Number(limit) || 20, 50);
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const [consultations, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        include: {
          astrologerProfile: true,
          customer: true,
          billingRecord: true,
          consultationReview: true,
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: Number(page) || 1,
        limit: take,
        consultations: consultations.map((c) => ({
          id: c.id,
          type: c.type,
          status: c.status,
          ratePaisePerMinute: c.ratePaisePerMinute,
          concern: c.concern,
          durationSeconds: c.durationSeconds,
          astrologerName: c.astrologerProfile.displayName,
          astrologerAvatar: c.astrologerProfile.avatarUrl,
          customerName: c.customer.fullName,
          totalAmountInr: c.billingRecord ? Number(c.billingRecord.totalAmountPaise) / 100 : null,
          rating: c.consultationReview?.rating || null,
          reviewText: c.consultationReview?.reviewText || null,
          createdAt: c.createdAt.toISOString(),
          endedAt: c.endedAt?.toISOString() || null,
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to fetch consultation history" });
  }
});

// 9. Single Consultation Details
consultationsRouter.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id },
      include: {
        astrologerProfile: true,
        customer: true,
        billingRecord: true,
        consultationReview: true,
        stateHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND" });
      return;
    }

    const isCustomer = consultation.customerId === userId;
    const isAstrologer = consultation.astrologerProfile.userId === userId;
    const isAdmin = role === "SUPER_ADMIN" || role === "SUPPORT";

    if (!isCustomer && !isAstrologer && !isAdmin) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: consultation.id,
        type: consultation.type,
        status: consultation.status,
        ratePaisePerMinute: consultation.ratePaisePerMinute,
        concern: consultation.concern,
        preferredLanguage: consultation.preferredLanguage,
        durationSeconds: consultation.durationSeconds,
        channelName: consultation.channelName,
        astrologer: {
          id: consultation.astrologerProfile.id,
          name: consultation.astrologerProfile.displayName,
          avatarUrl: consultation.astrologerProfile.avatarUrl,
          specialisations: consultation.astrologerProfile.specialisationsJson,
        },
        customer: {
          id: consultation.customer.id,
          name: consultation.customer.fullName,
        },
        billing: consultation.billingRecord
          ? {
              totalDurationSeconds: consultation.billingRecord.totalDurationSeconds,
              billableMinutes: consultation.billingRecord.billableMinutes,
              totalAmountInr: Number(consultation.billingRecord.totalAmountPaise) / 100,
              promoAmountInr: Number(consultation.billingRecord.promoAmountPaise) / 100,
              paidAmountInr: Number(consultation.billingRecord.paidAmountPaise) / 100,
              astrologerEarningsInr: Number(consultation.billingRecord.astrologerEarningsPaise) / 100,
            }
          : null,
        review: consultation.consultationReview,
        stateHistory: consultation.stateHistory.map((s) => ({
          fromState: s.fromState,
          toState: s.toState,
          reason: s.reason,
          createdAt: s.createdAt.toISOString(),
        })),
        createdAt: consultation.createdAt.toISOString(),
        acceptedAt: consultation.acceptedAt?.toISOString() || null,
        endedAt: consultation.endedAt?.toISOString() || null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to fetch consultation details" });
  }
});
