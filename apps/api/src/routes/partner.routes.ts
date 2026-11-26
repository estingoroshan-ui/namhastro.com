import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { FirebaseService } from "../services/firebase.service.js";
import { EarningsService } from "../services/earnings.service.js";
import { CommissionService } from "../services/commission.service.js";

export const partnerRouter = Router();

// Helper to generate human-readable application numbers
function generateApplicationNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `NA-APP-${rand}`;
}

// 1. Astrologer Application / Onboarding
partnerRouter.post("/apply", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      fullName: z.string().min(2).max(120),
      displayName: z.string().min(2).max(120),
      email: z.string().email(),
      phoneE164: z.string().min(10).max(20),
      dateOfBirth: z.string(),
      city: z.string().max(120),
      state: z.string().max(80),
      country: z.string().default("India"),
      preferredLanguage: z.string().default("en"),
      experienceYears: z.coerce.number().min(0).max(60),
      qualifications: z.string().min(3),
      specialisations: z.array(z.string()).min(1),
      languages: z.array(z.string()).min(1),
      bio: z.string().min(10),
      proposedChatRatePaise: z.coerce.number().min(100), // Min ₹1/min
      proposedAudioRatePaise: z.coerce.number().min(100),
      proposedVideoRatePaise: z.coerce.number().min(100),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const data = parsed.data;
    const userId = req.user!.id;

    // Check if user already has an active application
    const existingApp = await prisma.astrologerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (existingApp && (existingApp.status === "PENDING" || existingApp.status === "UNDER_REVIEW")) {
      res.status(409).json({
        success: false,
        error: "APPLICATION_EXISTS",
        message: "You already have an active application in review.",
        applicationNumber: existingApp.applicationNumber,
      });
      return;
    }

    // Update user role to ASTROLOGER if not admin
    if (req.user!.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "ASTROLOGER", fullName: data.fullName },
      });
    }

    // Generate unique slug for astrologer
    const baseSlug = data.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create or update AstrologerProfile
    const profile = await prisma.astrologerProfile.upsert({
      where: { userId },
      create: {
        userId,
        slug,
        displayName: data.displayName,
        verificationStage: "APPLIED",
        availabilityStatus: "OFFLINE",
        experienceYears: data.experienceYears,
        qualifications: data.qualifications,
        bio: data.bio,
        chatRatePaise: data.proposedChatRatePaise,
        audioRatePaise: data.proposedAudioRatePaise,
        videoRatePaise: data.proposedVideoRatePaise,
        specialisationsJson: data.specialisations,
        languagesJson: data.languages,
      },
      update: {
        displayName: data.displayName,
        experienceYears: data.experienceYears,
        qualifications: data.qualifications,
        bio: data.bio,
        specialisationsJson: data.specialisations,
        languagesJson: data.languages,
      },
    });

    // Create application record
    const application = await prisma.astrologerApplication.create({
      data: {
        userId,
        applicationNumber: generateApplicationNumber(),
        stage: "APPLIED",
        status: "UNDER_REVIEW",
        personalDetailsJson: {
          fullName: data.fullName,
          displayName: data.displayName,
          email: data.email,
          phoneE164: data.phoneE164,
          dateOfBirth: data.dateOfBirth,
          city: data.city,
          state: data.state,
          country: data.country,
          preferredLanguage: data.preferredLanguage,
        },
        professionalDetailsJson: {
          experienceYears: data.experienceYears,
          qualifications: data.qualifications,
          specialisations: data.specialisations,
          languages: data.languages,
          bio: data.bio,
          proposedChatRatePaise: data.proposedChatRatePaise,
          proposedAudioRatePaise: data.proposedAudioRatePaise,
          proposedVideoRatePaise: data.proposedVideoRatePaise,
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: "ASTROLOGER_APPLICATION_SUBMITTED",
        entityType: "AstrologerApplication",
        entityId: application.id,
        payloadJson: { applicationNumber: application.applicationNumber },
      },
    });

    res.status(201).json({
      success: true,
      message: "Astrologer application submitted successfully! Our verification team will review your credentials.",
      data: {
        applicationNumber: application.applicationNumber,
        stage: application.stage,
        status: application.status,
        profileId: profile.id,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to submit application" });
  }
});

// 2. Upload KYC Document
partnerRouter.post("/documents", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      type: z.enum(["GOVT_ID", "PAN_CARD", "ASTROLOGY_CERTIFICATE", "BANK_PROOF", "PROFILE_PHOTO", "INTRO_VIDEO"]),
      title: z.string().min(2).max(120),
      fileUrl: z.string().min(1),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { type, title, fileUrl, fileSize, mimeType } = parsed.data;
    const userId = req.user!.id;

    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    const application = await prisma.astrologerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const doc = await prisma.astrologerDocument.create({
      data: {
        applicationId: application?.id,
        astrologerProfileId: profile?.id,
        type,
        title,
        fileUrl,
        fileSize: fileSize || 0,
        mimeType: mimeType || "application/octet-stream",
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully and queued for verification.",
      data: doc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to upload document" });
  }
});

// 3. Save Bank Details
partnerRouter.post("/bank-details", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      accountHolderName: z.string().min(2).max(120),
      bankName: z.string().min(2).max(120),
      accountNumber: z.string().min(6).max(30),
      ifscCode: z.string().min(4).max(16),
      upiId: z.string().max(120).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = parsed.data;
    const userId = req.user!.id;

    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND", message: "Astrologer profile not found" });
      return;
    }

    // Mask account number: e.g. "XXXXXXXX1234"
    const visibleDigits = accountNumber.slice(-4);
    const masked = "X".repeat(Math.max(4, accountNumber.length - 4)) + visibleDigits;

    const bankAccount = await prisma.astrologerBankAccount.upsert({
      where: { astrologerProfileId: profile.id },
      create: {
        astrologerProfileId: profile.id,
        accountHolderName,
        bankName,
        accountNumberMasked: masked,
        ifscCode: ifscCode.toUpperCase(),
        upiId: upiId || null,
        isVerified: false,
      },
      update: {
        accountHolderName,
        bankName,
        accountNumberMasked: masked,
        ifscCode: ifscCode.toUpperCase(),
        upiId: upiId || null,
      },
    });

    res.json({
      success: true,
      message: "Bank details saved securely.",
      data: bankAccount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to save bank details" });
  }
});

// 4. Partner Dashboard Overview
partnerRouter.get("/dashboard", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId },
      include: {
        bankAccount: true,
        documents: true,
        schedules: true,
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND", message: "Astrologer profile not found" });
      return;
    }

    // Calculate real financial statistics from completed consultations
    const completedConsultations = await prisma.consultationRequest.findMany({
      where: {
        astrologerProfileId: profile.id,
        status: "COMPLETED",
      },
    });

    let totalRevenuePaise = 0;
    for (const c of completedConsultations) {
      const minutes = Math.max(1, Math.ceil(c.durationSeconds / 60));
      totalRevenuePaise += minutes * c.ratePaisePerMinute;
    }

    // Platform commission (default 20% / 2000 bps unless overridden)
    const commissionBps = profile.commissionBpsOverride ?? 2000;
    const commissionPaise = Math.floor((totalRevenuePaise * commissionBps) / 10000);
    const netEarningsPaise = totalRevenuePaise - commissionPaise;

    // Active pending consultation requests
    const pendingRequests = await prisma.consultationRequest.findMany({
      where: {
        astrologerProfileId: profile.id,
        status: "PENDING",
      },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });

    // Active waiting queue entries
    const waitingQueue = await prisma.consultationQueue.findMany({
      where: {
        astrologerProfileId: profile.id,
        status: "WAITING",
      },
      orderBy: { position: "asc" },
    });

    res.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          displayName: profile.displayName,
          slug: profile.slug,
          avatarUrl: profile.avatarUrl,
          verificationStage: profile.verificationStage,
          availabilityStatus: profile.availabilityStatus,
          isOnline: profile.isOnline,
          chatEnabled: profile.chatEnabled,
          audioEnabled: profile.audioEnabled,
          videoEnabled: profile.videoEnabled,
          chatRatePaise: profile.chatRatePaise,
          audioRatePaise: profile.audioRatePaise,
          videoRatePaise: profile.videoRatePaise,
          averageRating: profile.averageRating,
          totalReviews: profile.totalReviews,
          totalConsultations: completedConsultations.length,
        },
        earnings: {
          grossRevenuePaise: totalRevenuePaise,
          grossRevenueInr: (totalRevenuePaise / 100).toFixed(2),
          platformCommissionPaise: commissionPaise,
          commissionPercent: (commissionBps / 100).toFixed(1),
          netEarningsPaise,
          netEarningsInr: (netEarningsPaise / 100).toFixed(2),
          withdrawableBalancePaise: netEarningsPaise,
          withdrawableBalanceInr: (netEarningsPaise / 100).toFixed(2),
        },
        pendingRequestsCount: pendingRequests.length,
        pendingRequests,
        waitingQueueCount: waitingQueue.length,
        waitingQueue,
        bankAccountConfigured: !!profile.bankAccount,
        bankAccountVerified: !!profile.bankAccount?.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to load partner dashboard" });
  }
});

// 5. Real-Time Availability Engine Toggle
partnerRouter.patch("/availability", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      isOnline: z.boolean().optional(),
      availabilityStatus: z.enum(["ONLINE", "OFFLINE", "BUSY"]).optional(),
      chatEnabled: z.boolean().optional(),
      audioEnabled: z.boolean().optional(),
      videoEnabled: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND", message: "Astrologer profile not found" });
      return;
    }

    const data = parsed.data;
    const updatedStatus = data.availabilityStatus || (data.isOnline !== undefined ? (data.isOnline ? "ONLINE" : "OFFLINE") : profile.availabilityStatus);
    const updatedIsOnline = data.isOnline !== undefined ? data.isOnline : updatedStatus === "ONLINE";

    const updated = await prisma.astrologerProfile.update({
      where: { id: profile.id },
      data: {
        isOnline: updatedIsOnline,
        availabilityStatus: updatedStatus,
        chatEnabled: data.chatEnabled !== undefined ? data.chatEnabled : profile.chatEnabled,
        audioEnabled: data.audioEnabled !== undefined ? data.audioEnabled : profile.audioEnabled,
        videoEnabled: data.videoEnabled !== undefined ? data.videoEnabled : profile.videoEnabled,
        lastHeartbeatAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Availability updated to ${updatedStatus}`,
      data: {
        isOnline: updated.isOnline,
        availabilityStatus: updated.availabilityStatus,
        chatEnabled: updated.chatEnabled,
        audioEnabled: updated.audioEnabled,
        videoEnabled: updated.videoEnabled,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message || "Failed to update availability" });
  }
});

// 6. Heartbeat Ping
partnerRouter.post("/heartbeat", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await prisma.astrologerProfile.updateMany({
      where: { userId },
      data: { lastHeartbeatAt: new Date() },
    });
    res.json({ success: true, timestamp: new Date() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "HEARTBEAT_FAILED" });
  }
});

// 7. Rate Change Request
partnerRouter.post("/rate-change-request", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      proposedChatRatePaise: z.coerce.number().min(100),
      proposedAudioRatePaise: z.coerce.number().min(100),
      proposedVideoRatePaise: z.coerce.number().min(100),
      reason: z.string().min(5),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { proposedChatRatePaise, proposedAudioRatePaise, proposedVideoRatePaise, reason } = parsed.data;
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    const request = await prisma.rateChangeRequest.create({
      data: {
        astrologerProfileId: profile.id,
        currentChatRatePaise: profile.chatRatePaise,
        proposedChatRatePaise,
        currentAudioRatePaise: profile.audioRatePaise,
        proposedAudioRatePaise,
        currentVideoRatePaise: profile.videoRatePaise,
        proposedVideoRatePaise,
        reason,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message: "Rate change request submitted for Super Admin review.",
      data: request,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 8. Dedicated Astrologer Earnings & Ledger Endpoint (Step 8)
partnerRouter.get("/earnings", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId },
      include: {
        bankAccount: true,
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    const summary = await EarningsService.getSummary(profile.id);

    // Fetch recent ledger entries
    const ledgerEntries = await prisma.earningsLedgerEntry.findMany({
      where: { astrologerProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Fetch recent withdrawal requests
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { astrologerProfileId: profile.id },
      orderBy: { requestedAt: "desc" },
      take: 20,
    });

    res.json({
      success: true,
      data: {
        summary,
        bankAccount: profile.bankAccount
          ? {
              id: profile.bankAccount.id,
              accountHolderName: profile.bankAccount.accountHolderName,
              bankName: profile.bankAccount.bankName,
              accountNumberMasked: profile.bankAccount.accountNumberMasked,
              ifscCode: profile.bankAccount.ifscCode,
              accountType: profile.bankAccount.accountType,
              panNumber: profile.bankAccount.panNumber,
              isVerified: profile.bankAccount.isVerified,
            }
          : null,
        ledgerEntries: ledgerEntries.map((e) => ({
          id: e.id,
          type: e.type,
          amountPaise: e.amountPaise.toString(),
          amountInr: (Number(e.amountPaise) / 100).toFixed(2),
          balanceAfterInr: (Number(e.balanceAfterPaise) / 100).toFixed(2),
          status: e.status,
          description: e.description,
          createdAt: e.createdAt,
          metadata: e.metadataJson,
        })),
        withdrawals: withdrawals.map((w) => ({
          id: w.id,
          requestNumber: w.requestNumber,
          amountInr: (Number(w.amountPaise) / 100).toFixed(2),
          tdsAmountInr: (Number(w.tdsAmountPaise) / 100).toFixed(2),
          netAmountInr: (Number(w.netAmountPaise) / 100).toFixed(2),
          status: w.status,
          utrNumber: w.utrNumber,
          rejectionReason: w.rejectionReason,
          requestedAt: w.requestedAt,
          processedAt: w.processedAt,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 9. Bank Account Management
partnerRouter.get("/bank-account", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId },
      include: { bankAccount: true },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    if (!profile.bankAccount) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({
      success: true,
      data: {
        id: profile.bankAccount.id,
        accountHolderName: profile.bankAccount.accountHolderName,
        bankName: profile.bankAccount.bankName,
        accountNumberMasked: profile.bankAccount.accountNumberMasked,
        ifscCode: profile.bankAccount.ifscCode,
        accountType: profile.bankAccount.accountType,
        panNumber: profile.bankAccount.panNumber,
        upiId: profile.bankAccount.upiId,
        isVerified: profile.bankAccount.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

partnerRouter.post("/bank-account", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      accountHolderName: z.string().min(2).max(120),
      bankName: z.string().min(2).max(120),
      accountNumber: z.string().min(8).max(24),
      ifscCode: z.string().length(11).regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
      accountType: z.enum(["SAVINGS", "CURRENT"]).default("SAVINGS"),
      panNumber: z.string().length(10).regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional(),
      upiId: z.string().min(3).max(64).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const data = parsed.data;
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    const masked = `•••• •••• ${data.accountNumber.slice(-4)}`;

    const bankAccount = await prisma.astrologerBankAccount.upsert({
      where: { astrologerProfileId: profile.id },
      create: {
        astrologerProfileId: profile.id,
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumberMasked: masked,
        ifscCode: data.ifscCode.toUpperCase(),
        accountType: data.accountType,
        panNumber: data.panNumber?.toUpperCase() || null,
        upiId: data.upiId || null,
        isVerified: true, // Auto-verified for active astrologer partner
      },
      update: {
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        accountNumberMasked: masked,
        ifscCode: data.ifscCode.toUpperCase(),
        accountType: data.accountType,
        panNumber: data.panNumber?.toUpperCase() || null,
        upiId: data.upiId || null,
        isVerified: true,
      },
    });

    res.json({
      success: true,
      message: "Bank account updated and verified successfully.",
      data: {
        id: bankAccount.id,
        accountHolderName: bankAccount.accountHolderName,
        bankName: bankAccount.bankName,
        accountNumberMasked: bankAccount.accountNumberMasked,
        ifscCode: bankAccount.ifscCode,
        accountType: bankAccount.accountType,
        panNumber: bankAccount.panNumber,
        isVerified: bankAccount.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 10. Atomic Withdrawal Request (Step 8 Enterprise Engine)
partnerRouter.post("/withdraw", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      amountPaise: z.coerce.number().min(50000, "Minimum withdrawal is ₹500").max(5000000, "Maximum withdrawal is ₹50,000"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { amountPaise } = parsed.data;
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({
      where: { userId },
      include: { bankAccount: true },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    if (!profile.bankAccount) {
      res.status(400).json({ success: false, error: "BANK_ACCOUNT_MISSING", message: "Please link a verified bank account before requesting a withdrawal." });
      return;
    }

    const withdrawal = await EarningsService.requestWithdrawal({
      astrologerProfileId: profile.id,
      amountPaise: BigInt(amountPaise),
      bankAccountId: profile.bankAccount.id,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully. Funds have been atomically reserved.",
      data: {
        id: withdrawal.id,
        requestNumber: withdrawal.requestNumber,
        amountInr: (Number(withdrawal.amountPaise) / 100).toFixed(2),
        netAmountInr: (Number(withdrawal.netAmountPaise) / 100).toFixed(2),
        status: withdrawal.status,
      },
    });
  } catch (error: any) {
    const status = error.message?.includes("INSUFFICIENT") ? 400 : 500;
    res.status(status).json({ success: false, error: error.message || "WITHDRAWAL_FAILED" });
  }
});

// 11. List Astrologer Withdrawals
partnerRouter.get("/withdrawals", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { astrologerProfileId: profile.id },
      orderBy: { requestedAt: "desc" },
    });

    res.json({
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        requestNumber: w.requestNumber,
        amountInr: (Number(w.amountPaise) / 100).toFixed(2),
        tdsAmountInr: (Number(w.tdsAmountPaise) / 100).toFixed(2),
        netAmountInr: (Number(w.netAmountPaise) / 100).toFixed(2),
        status: w.status,
        utrNumber: w.utrNumber,
        rejectionReason: w.rejectionReason,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 12. Cancel Withdrawal Request
partnerRouter.post("/withdrawals/:id/cancel", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.astrologerProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ success: false, error: "PROFILE_NOT_FOUND" });
      return;
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: req.params.id as string },
    });

    if (!withdrawal || withdrawal.astrologerProfileId !== profile.id) {
      res.status(404).json({ success: false, error: "WITHDRAWAL_NOT_FOUND" });
      return;
    }

    if (withdrawal.status !== "REQUESTED" && withdrawal.status !== "UNDER_REVIEW") {
      res.status(400).json({ success: false, error: "CANNOT_CANCEL_IN_CURRENT_STATUS" });
      return;
    }

    const cancelled = await EarningsService.rejectWithdrawal({
      withdrawalId: withdrawal.id,
      reason: "Cancelled by astrologer",
      rejectedByUserId: userId,
    });

    res.json({
      success: true,
      message: "Withdrawal request cancelled. Reserved funds returned to available balance.",
      data: cancelled,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 10. Register Device Token (FCM Push Notifications)
partnerRouter.post("/device-token", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token, platform = "web", deviceName } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({ success: false, error: "INVALID_TOKEN", message: "FCM device token is required" });
      return;
    }
    const record = await FirebaseService.registerToken(userId, token, platform, deviceName);
    res.json({ success: true, message: "Device token registered successfully", data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});
