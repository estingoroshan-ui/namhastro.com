import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { emitToConsultation } from "../services/socket.service.js";
import { FirebaseService } from "../services/firebase.service.js";

export const chatRouter = Router();

// 1. Fetch message history for a consultation
chatRouter.get("/:consultationId/messages", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;
    const role = req.user!.role;

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
    const isAdmin = role === "SUPER_ADMIN" || role === "SUPPORT";

    if (!isCustomer && !isAstrologer && !isAdmin) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Access to consultation messages denied" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await prisma.chatMessage.findMany({
      where: { consultationId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    res.json({
      success: true,
      data: {
        consultationId,
        status: consultation.status,
        type: consultation.type,
        ratePaisePerMinute: consultation.ratePaisePerMinute,
        messages: messages.map((m) => ({
          id: m.id,
          clientMessageId: m.clientMessageId,
          senderId: m.senderId,
          senderRole: m.senderRole,
          type: m.type,
          content: m.content,
          attachmentUrl: m.attachmentUrl,
          attachmentMeta: m.attachmentMeta,
          status: m.status,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to fetch messages" });
  }
});

// 2. HTTP Fallback to Post Message
chatRouter.post("/:consultationId/messages", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;

    const schema = z.object({
      clientMessageId: z.string().optional(),
      type: z.enum(["TEXT", "IMAGE", "PDF", "VOICE", "KUNDLI", "SYSTEM"]).default("TEXT"),
      content: z.string().min(1).max(5000),
      attachmentUrl: z.string().url().optional(),
      attachmentMeta: z.record(z.any()).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { clientMessageId, type, content, attachmentUrl, attachmentMeta } = parsed.data;

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
    const isAdmin = req.user!.role === "SUPER_ADMIN";

    if (!isCustomer && !isAstrologer && !isAdmin) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Not a participant of this consultation" });
      return;
    }

    const allowedStates = ["PENDING", "ACCEPTED", "CONNECTING", "ACTIVE"];
    if (!allowedStates.includes(consultation.status)) {
      res.status(400).json({
        success: false,
        error: "CONSULTATION_INACTIVE",
        message: `Consultation is already ${consultation.status}`,
      });
      return;
    }

    let senderRole = "CUSTOMER";
    if (isAstrologer) senderRole = "ASTROLOGER";
    if (isAdmin) senderRole = "SYSTEM";

    // Deduplication
    if (clientMessageId) {
      const existing = await prisma.chatMessage.findFirst({
        where: { consultationId, clientMessageId },
      });
      if (existing) {
        res.json({ success: true, data: existing, deduplicated: true });
        return;
      }
    }

    const msg = await prisma.chatMessage.create({
      data: {
        consultationId,
        clientMessageId: clientMessageId || null,
        senderId: userId,
        senderRole,
        type,
        content: content.trim(),
        attachmentUrl: attachmentUrl || null,
        attachmentMeta: attachmentMeta ? (attachmentMeta as any) : undefined,
        status: "SENT",
      },
    });

    const msgPayload = {
      id: msg.id,
      clientMessageId: msg.clientMessageId,
      consultationId: msg.consultationId,
      senderId: msg.senderId,
      senderRole: msg.senderRole,
      type: msg.type,
      content: msg.content,
      attachmentUrl: msg.attachmentUrl,
      attachmentMeta: msg.attachmentMeta,
      status: msg.status,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    };

    // Broadcast via socket
    emitToConsultation(consultationId, "message:received", msgPayload);

    // Push notification to recipient
    const recipientId = isCustomer ? consultation.astrologerProfile.userId : consultation.customerId;
    FirebaseService.sendPush({
      userId: recipientId,
      category: "NEW_CHAT_MESSAGE",
      title: `Message from ${isCustomer ? "Customer" : consultation.astrologerProfile.displayName}`,
      body: type === "TEXT" ? content.slice(0, 80) : `Sent an attachment [${type}]`,
      actionUrl: `/consultation/chat?id=${consultationId}`,
      data: { consultationId, messageId: msg.id },
    }).catch(() => {});

    res.status(201).json({ success: true, data: msgPayload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to post message" });
  }
});

// 3. Mark messages as read
chatRouter.post("/:consultationId/read", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      res.status(400).json({ success: false, error: "MESSAGE_IDS_REQUIRED" });
      return;
    }

    await prisma.chatMessage.updateMany({
      where: {
        consultationId,
        id: { in: messageIds },
        senderId: { not: userId },
      },
      data: {
        isRead: true,
        status: "READ",
        readAt: new Date(),
      },
    });

    emitToConsultation(consultationId, "message:read", {
      consultationId,
      readBy: userId,
      messageIds,
      readAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Messages marked as read" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to mark read" });
  }
});

// 4. Astrologer Private Consultation Notes (GET & POST)
chatRouter.get("/:consultationId/notes", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation || consultation.astrologerProfile.userId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the assigned astrologer can view private notes" });
      return;
    }

    const notes = await prisma.privateConsultationNote.findMany({
      where: { consultationId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: notes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to fetch notes" });
  }
});

chatRouter.post("/:consultationId/notes", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;
    const { note } = req.body;

    if (!note || typeof note !== "string" || !note.trim()) {
      res.status(400).json({ success: false, error: "NOTE_REQUIRED" });
      return;
    }

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation || consultation.astrologerProfile.userId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the assigned astrologer can add private notes" });
      return;
    }

    const savedNote = await prisma.privateConsultationNote.create({
      data: {
        consultationId,
        astrologerProfileId: consultation.astrologerProfileId,
        note: note.trim(),
      },
    });

    res.status(201).json({ success: true, data: savedNote });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to save note" });
  }
});

// 5. Customer Consultation Review
chatRouter.post("/:consultationId/review", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;

    const schema = z.object({
      rating: z.number().int().min(1).max(5),
      reviewText: z.string().max(1000).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const { rating, reviewText } = parsed.data;

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
      include: { astrologerProfile: true },
    });

    if (!consultation) {
      res.status(404).json({ success: false, error: "NOT_FOUND" });
      return;
    }

    if (consultation.customerId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Only the customer can review this consultation" });
      return;
    }

    if (consultation.status !== "COMPLETED") {
      res.status(400).json({ success: false, error: "NOT_COMPLETED", message: "Cannot review an uncompleted consultation" });
      return;
    }

    // Upsert review
    const review = await prisma.consultationReview.upsert({
      where: { consultationId },
      create: {
        consultationId,
        customerId: userId,
        astrologerProfileId: consultation.astrologerProfileId,
        rating,
        reviewText: reviewText?.trim() || null,
        isPublic: true,
      },
      update: {
        rating,
        reviewText: reviewText?.trim() || null,
      },
    });

    // Recalculate astrologer rating
    const reviews = await prisma.consultationReview.findMany({
      where: { astrologerProfileId: consultation.astrologerProfileId },
    });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.astrologerProfile.update({
      where: { id: consultation.astrologerProfileId },
      data: {
        averageRating: Number(avgRating.toFixed(2)),
        totalReviews: reviews.length,
      },
    });

    res.json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to submit review" });
  }
});

// 6. Raise Consultation Dispute
chatRouter.post("/:consultationId/dispute", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const consultationId = String(req.params.consultationId);
    const userId = req.user!.id;
    const { reason } = req.body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      res.status(400).json({ success: false, error: "REASON_REQUIRED" });
      return;
    }

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id: consultationId },
    });

    if (!consultation || consultation.customerId !== userId) {
      res.status(403).json({ success: false, error: "UNAUTHORIZED" });
      return;
    }

    const dispute = await prisma.consultationDispute.create({
      data: {
        consultationId,
        raisedById: userId,
        reason: reason.trim(),
        status: "OPEN",
      },
    });

    res.status(201).json({
      success: true,
      message: "Dispute submitted successfully. Our team will review within 24 hours.",
      data: dispute,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err?.message || "Failed to raise dispute" });
  }
});
