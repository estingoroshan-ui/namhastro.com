import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

// Middleware: Require Super Admin or Support role
function requireAdminOrStaff(req: AuthenticatedRequest, res: Response, next: () => void) {
  if (!req.user || (req.user.role !== "SUPER_ADMIN" && req.user.role !== "VERIFICATION" && req.user.role !== "SUPPORT")) {
    res.status(403).json({ success: false, error: "FORBIDDEN", message: "Super Admin or Verification Staff access required" });
    return;
  }
  next();
}

adminRouter.use(requireAuth, requireAdminOrStaff);

// 1. List all Astrologers with multi-filter & search
adminRouter.get("/astrologers", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const stage = req.query.stage as any;
    const availability = req.query.availability as any;
    const search = req.query.search ? String(req.query.search).trim() : "";

    const where: any = {};
    if (stage) where.verificationStage = stage;
    if (availability) where.availabilityStatus = availability;
    if (search) {
      where.OR = [
        { displayName: { contains: search } },
        { slug: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, astrologers] = await Promise.all([
      prisma.astrologerProfile.count({ where }),
      prisma.astrologerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneE164: true,
              status: true,
            },
          },
          bankAccount: true,
          documents: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: astrologers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 2. List Astrologer Applications
adminRouter.get("/applications", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const stage = req.query.stage as any;

    const where: any = {};
    if (status) where.status = status;
    if (stage) where.stage = stage;

    const applications = await prisma.astrologerApplication.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phoneE164: true } },
        documents: true,
        interviews: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 3. Application Details
adminRouter.get("/applications/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.astrologerApplication.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        documents: true,
        interviews: true,
      },
    });

    if (!application) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Application not found" });
      return;
    }

    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 4. Verify Document
adminRouter.post("/applications/:id/verify-document", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      documentId: z.string().min(1),
      status: z.enum(["VERIFIED", "REJECTED", "RE_UPLOAD_REQUESTED"]),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { documentId, status, notes } = parsed.data;
    const doc = await prisma.astrologerDocument.update({
      where: { id: documentId },
      data: {
        status,
        verificationNotes: notes || null,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
    });

    res.json({ success: true, message: `Document marked as ${status}`, data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 5. Schedule Interview
adminRouter.post("/applications/:id/schedule-interview", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      scheduledAt: z.string(),
      mode: z.enum(["VIDEO", "AUDIO", "IN_PERSON"]).default("VIDEO"),
      meetingLink: z.string().optional(),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { scheduledAt, mode, meetingLink, notes } = parsed.data;
    const applicationId = req.params.id;

    const interview = await prisma.astrologerInterview.create({
      data: {
        applicationId,
        scheduledAt: new Date(scheduledAt),
        mode,
        meetingLink: meetingLink || null,
        interviewerNotes: notes || null,
        status: "SCHEDULED",
      },
    });

    await prisma.astrologerApplication.update({
      where: { id: applicationId },
      data: { stage: "INTERVIEW", status: "INTERVIEW_SCHEDULED" },
    });

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully.",
      data: interview,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 6. Approve Application & Activate Astrologer
adminRouter.post("/applications/:id/approve", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      chatRatePaise: z.coerce.number().min(100),
      audioRatePaise: z.coerce.number().min(100),
      videoRatePaise: z.coerce.number().min(100),
      commissionBpsOverride: z.coerce.number().min(0).max(10000).optional(),
      chatEnabled: z.boolean().default(true),
      audioEnabled: z.boolean().default(true),
      videoEnabled: z.boolean().default(true),
      adminNotes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const applicationId = req.params.id;
    const application = await prisma.astrologerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      res.status(404).json({ success: false, error: "NOT_FOUND", message: "Application not found" });
      return;
    }

    const data = parsed.data;

    // Update application
    await prisma.astrologerApplication.update({
      where: { id: applicationId },
      data: {
        stage: "APPROVED",
        status: "APPROVED",
        adminNotes: data.adminNotes || "Approved by Super Admin",
        reviewedAt: new Date(),
      },
    });

    // Update user status to ACTIVE
    await prisma.user.update({
      where: { id: application.userId },
      data: { status: "ACTIVE", role: "ASTROLOGER" },
    });

    // Update astrologer profile
    const profile = await prisma.astrologerProfile.upsert({
      where: { userId: application.userId },
      create: {
        userId: application.userId,
        slug: `astrologer-${application.userId.slice(-6)}`,
        displayName: application.user.fullName,
        verificationStage: "ACTIVE",
        availabilityStatus: "ONLINE",
        isOnline: true,
        chatEnabled: data.chatEnabled,
        audioEnabled: data.audioEnabled,
        videoEnabled: data.videoEnabled,
        chatRatePaise: data.chatRatePaise,
        audioRatePaise: data.audioRatePaise,
        videoRatePaise: data.videoRatePaise,
        commissionBpsOverride: data.commissionBpsOverride || null,
      },
      update: {
        verificationStage: "ACTIVE",
        availabilityStatus: "ONLINE",
        isOnline: true,
        chatEnabled: data.chatEnabled,
        audioEnabled: data.audioEnabled,
        videoEnabled: data.videoEnabled,
        chatRatePaise: data.chatRatePaise,
        audioRatePaise: data.audioRatePaise,
        videoRatePaise: data.videoRatePaise,
        commissionBpsOverride: data.commissionBpsOverride || null,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorUserId: req.user!.id,
        action: "ASTROLOGER_APPROVED_AND_ACTIVATED",
        entityType: "AstrologerProfile",
        entityId: profile.id,
        payloadJson: {
          applicationId,
          rates: { chat: data.chatRatePaise, audio: data.audioRatePaise, video: data.videoRatePaise },
        },
      },
    });

    res.json({
      success: true,
      message: "Astrologer approved, rates configured, and account activated on marketplace!",
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 7. Reject Application
adminRouter.post("/applications/:id/reject", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason = "Application did not meet qualification criteria" } = req.body;
    const applicationId = req.params.id;

    const application = await prisma.astrologerApplication.update({
      where: { id: applicationId },
      data: {
        stage: "REJECTED",
        status: "REJECTED",
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    res.json({ success: true, message: "Application rejected", data: application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 8. Suspend or Reactivate Astrologer
adminRouter.patch("/astrologers/:id/status", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      stage: z.enum(["ACTIVE", "SUSPENDED", "APPROVED", "REJECTED"]),
      reason: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { stage, reason } = parsed.data;
    const profile = await prisma.astrologerProfile.update({
      where: { id: req.params.id },
      data: {
        verificationStage: stage,
        availabilityStatus: stage === "ACTIVE" ? "ONLINE" : "OFFLINE",
        isOnline: stage === "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: req.user!.id,
        action: `ASTROLOGER_STATUS_CHANGED_TO_${stage}`,
        entityType: "AstrologerProfile",
        entityId: profile.id,
        payloadJson: { reason },
      },
    });

    res.json({ success: true, message: `Astrologer status updated to ${stage}`, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 9. Super Admin Updates Individual Consultation Rates
adminRouter.patch("/astrologers/:id/rates", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      chatRatePaise: z.coerce.number().min(100).optional(),
      audioRatePaise: z.coerce.number().min(100).optional(),
      videoRatePaise: z.coerce.number().min(100).optional(),
      commissionBpsOverride: z.coerce.number().min(0).max(10000).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const profile = await prisma.astrologerProfile.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    res.json({ success: true, message: "Consultation rates updated successfully", data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 10. List Rate Change Requests
adminRouter.get("/rate-change-requests", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const requests = await prisma.rateChangeRequest.findMany({
      include: { astrologerProfile: true },
      orderBy: { requestedAt: "desc" },
    });
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 11. Review Rate Change Request
adminRouter.post("/rate-change-requests/:id/review", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      action: z.enum(["APPROVE", "REJECT"]),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { action, notes } = parsed.data;
    const request = await prisma.rateChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!request) {
      res.status(404).json({ success: false, error: "NOT_FOUND" });
      return;
    }

    if (action === "APPROVE") {
      await prisma.rateChangeRequest.update({
        where: { id: request.id },
        data: { status: "APPROVED", adminNotes: notes || null, reviewedAt: new Date() },
      });

      await prisma.astrologerProfile.update({
        where: { id: request.astrologerProfileId },
        data: {
          chatRatePaise: request.proposedChatRatePaise,
          audioRatePaise: request.proposedAudioRatePaise,
          videoRatePaise: request.proposedVideoRatePaise,
        },
      });
    } else {
      await prisma.rateChangeRequest.update({
        where: { id: request.id },
        data: { status: "REJECTED", adminNotes: notes || null, reviewedAt: new Date() },
      });
    }

    res.json({ success: true, message: `Rate change request ${action === "APPROVE" ? "approved and rates updated" : "rejected"}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 12. List Withdrawal Requests
adminRouter.get("/withdrawals", async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        astrologerProfile: {
          include: {
            bankAccount: true,
            user: { select: { fullName: true, phoneE164: true } },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    res.json({
      success: true,
      data: withdrawals.map((w) => ({
        ...w,
        amountInr: (Number(w.amountPaise) / 100).toFixed(2),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 13. Process Withdrawal Request
adminRouter.post("/withdrawals/:id/process", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(["PROCESSING", "COMPLETED", "REJECTED"]),
      payoutReference: z.string().optional(),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { status, payoutReference, notes } = parsed.data;
    const withdrawal = await prisma.withdrawalRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        payoutReference: payoutReference || null,
        adminNotes: notes || null,
        processedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    res.json({ success: true, message: `Withdrawal marked as ${status}`, data: withdrawal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});
