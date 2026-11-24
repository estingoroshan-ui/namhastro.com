import { Router, type Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const customerRouter = Router();

// All customer routes require authentication
customerRouter.use(requireAuth);

/* ==============================================================================
   PROFILE MANAGEMENT
============================================================================== */

customerRouter.get("/profile", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      include: {
        customerProfile: true,
        wallet: true,
      },
    });

    res.status(200).json({
      success: true,
      profile: {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneE164,
        preferredLanguage: user.preferredLanguage,
        status: user.status,
        avatarUrl: user.customerProfile?.avatarUrl || null,
        dateOfBirth: user.customerProfile?.dateOfBirth || null,
        timeOfBirth: user.customerProfile?.timeOfBirth || null,
        isBirthTimeUnknown: user.customerProfile?.isBirthTimeUnknown || false,
        birthPlace: user.customerProfile?.birthPlace || null,
        birthLatitude: user.customerProfile?.birthLatitude || null,
        birthLongitude: user.customerProfile?.birthLongitude || null,
        birthTimezone: user.customerProfile?.birthTimezone || "Asia/Kolkata",
        currentCity: user.customerProfile?.currentCity || null,
        gender: user.customerProfile?.gender || null,
        maritalStatus: user.customerProfile?.maritalStatus || null,
        consultationInterests: user.customerProfile?.consultationInterests || [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: "PROFILE_FETCH_FAILED", message: "Failed to retrieve profile." });
  }
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  email: z.string().email().optional().nullable(),
  preferredLanguage: z.string().max(16).optional(),
  avatarUrl: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  timeOfBirth: z.string().optional().nullable(),
  isBirthTimeUnknown: z.boolean().optional(),
  birthPlace: z.string().max(191).optional().nullable(),
  birthLatitude: z.number().optional().nullable(),
  birthLongitude: z.number().optional().nullable(),
  birthTimezone: z.string().default("Asia/Kolkata").optional(),
  currentCity: z.string().max(120).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  maritalStatus: z.string().max(32).optional().nullable(),
  consultationInterests: z.array(z.string()).optional(),
});

customerRouter.put("/profile", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Invalid profile data provided.",
        details: parsed.error.flatten(),
      });
      return;
    }

    const {
      fullName,
      email,
      preferredLanguage,
      avatarUrl,
      dateOfBirth,
      timeOfBirth,
      isBirthTimeUnknown,
      birthPlace,
      birthLatitude,
      birthLongitude,
      birthTimezone,
      currentCity,
      gender,
      maritalStatus,
      consultationInterests,
    } = parsed.data;

    // Update User table
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(preferredLanguage ? { preferredLanguage } : {}),
      },
    });

    // Upsert CustomerProfile
    const profile = await prisma.customerProfile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        avatarUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        timeOfBirth,
        isBirthTimeUnknown: Boolean(isBirthTimeUnknown),
        birthPlace,
        birthLatitude,
        birthLongitude,
        birthTimezone: birthTimezone || "Asia/Kolkata",
        currentCity,
        gender,
        maritalStatus,
        consultationInterests: consultationInterests || [],
      },
      update: {
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
        ...(timeOfBirth !== undefined ? { timeOfBirth } : {}),
        ...(isBirthTimeUnknown !== undefined ? { isBirthTimeUnknown } : {}),
        ...(birthPlace !== undefined ? { birthPlace } : {}),
        ...(birthLatitude !== undefined ? { birthLatitude } : {}),
        ...(birthLongitude !== undefined ? { birthLongitude } : {}),
        ...(birthTimezone !== undefined ? { birthTimezone } : {}),
        ...(currentCity !== undefined ? { currentCity } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(maritalStatus !== undefined ? { maritalStatus } : {}),
        ...(consultationInterests !== undefined ? { consultationInterests } : {}),
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      error: "PROFILE_UPDATE_FAILED",
      message: error instanceof Error ? error.message : "Failed to update profile.",
    });
  }
});

/* ==============================================================================
   MULTIPLE BIRTH PROFILES
============================================================================== */

customerRouter.get("/birth-profiles", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profiles = await prisma.birthProfile.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json({
      success: true,
      total: profiles.length,
      profiles,
    });
  } catch (error) {
    res.status(500).json({ error: "BIRTH_PROFILES_FETCH_FAILED", message: "Failed to fetch birth profiles." });
  }
});

const birthProfileSchema = z.object({
  relation: z.enum(["SELF", "SPOUSE", "SON", "DAUGHTER", "FATHER", "MOTHER", "OTHER"]).default("SELF"),
  fullName: z.string().min(2).max(120),
  gender: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string(), // ISO string YYYY-MM-DD
  timeOfBirth: z.string().max(16).optional().nullable(),
  isBirthTimeUnknown: z.boolean().default(false),
  birthPlace: z.string().min(2).max(191),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  timezone: z.string().default("Asia/Kolkata"),
  maritalStatus: z.string().max(32).optional().nullable(),
  isDefault: z.boolean().default(false),
});

customerRouter.post("/birth-profiles", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = birthProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Please provide valid birth details (name, date of birth, birth place).",
        details: parsed.error.flatten(),
      });
      return;
    }

    const {
      relation,
      fullName,
      gender,
      dateOfBirth,
      timeOfBirth,
      isBirthTimeUnknown,
      birthPlace,
      latitude,
      longitude,
      timezone,
      maritalStatus,
      isDefault,
    } = parsed.data;

    // If marked as default, unset existing default
    if (isDefault) {
      await prisma.birthProfile.updateMany({
        where: { userId: req.user!.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If first profile, auto-set as default
    const existingCount = await prisma.birthProfile.count({ where: { userId: req.user!.id } });
    const shouldBeDefault = isDefault || existingCount === 0;

    const profile = await prisma.birthProfile.create({
      data: {
        userId: req.user!.id,
        relation,
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        timeOfBirth: isBirthTimeUnknown ? null : timeOfBirth,
        isBirthTimeUnknown,
        birthPlace,
        latitude,
        longitude,
        timezone,
        maritalStatus,
        isDefault: shouldBeDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: "Birth profile created successfully.",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      error: "BIRTH_PROFILE_CREATE_FAILED",
      message: error instanceof Error ? error.message : "Failed to create birth profile.",
    });
  }
});

customerRouter.put("/birth-profiles/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.birthProfile.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Birth profile not found." });
      return;
    }

    const parsed = birthProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_REQUEST", details: parsed.error.flatten() });
      return;
    }

    if (parsed.data.isDefault) {
      await prisma.birthProfile.updateMany({
        where: { userId: req.user!.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.birthProfile.update({
      where: { id },
      data: {
        ...(parsed.data.relation ? { relation: parsed.data.relation } : {}),
        ...(parsed.data.fullName ? { fullName: parsed.data.fullName } : {}),
        ...(parsed.data.gender !== undefined ? { gender: parsed.data.gender } : {}),
        ...(parsed.data.dateOfBirth ? { dateOfBirth: new Date(parsed.data.dateOfBirth) } : {}),
        ...(parsed.data.timeOfBirth !== undefined ? { timeOfBirth: parsed.data.timeOfBirth } : {}),
        ...(parsed.data.isBirthTimeUnknown !== undefined ? { isBirthTimeUnknown: parsed.data.isBirthTimeUnknown } : {}),
        ...(parsed.data.birthPlace ? { birthPlace: parsed.data.birthPlace } : {}),
        ...(parsed.data.latitude !== undefined ? { latitude: parsed.data.latitude } : {}),
        ...(parsed.data.longitude !== undefined ? { longitude: parsed.data.longitude } : {}),
        ...(parsed.data.timezone ? { timezone: parsed.data.timezone } : {}),
        ...(parsed.data.maritalStatus !== undefined ? { maritalStatus: parsed.data.maritalStatus } : {}),
        ...(parsed.data.isDefault !== undefined ? { isDefault: parsed.data.isDefault } : {}),
      },
    });

    res.status(200).json({ success: true, profile: updated });
  } catch (error) {
    res.status(500).json({ error: "UPDATE_FAILED", message: "Failed to update birth profile." });
  }
});

customerRouter.delete("/birth-profiles/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.birthProfile.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Birth profile not found." });
      return;
    }

    await prisma.birthProfile.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Birth profile deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "DELETE_FAILED", message: "Failed to delete birth profile." });
  }
});

customerRouter.post("/birth-profiles/:id/default", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.birthProfile.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Birth profile not found." });
      return;
    }

    await prisma.birthProfile.updateMany({
      where: { userId: req.user!.id, isDefault: true },
      data: { isDefault: false },
    });

    const updated = await prisma.birthProfile.update({
      where: { id },
      data: { isDefault: true },
    });

    res.status(200).json({ success: true, message: "Default birth profile updated.", profile: updated });
  } catch (error) {
    res.status(500).json({ error: "SET_DEFAULT_FAILED", message: "Failed to set default profile." });
  }
});

/* ==============================================================================
   FAVOURITES & FOLLOWS
============================================================================== */

customerRouter.get("/favourites", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const favourites = await prisma.astrologerFavourite.findMany({
      where: { userId: req.user!.id },
      include: {
        astrologerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      total: favourites.length,
      favourites: favourites.map((f) => ({
        id: f.id,
        astrologer: f.astrologerProfile,
        addedAt: f.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "FAVOURITES_FETCH_FAILED", message: "Failed to retrieve favourites." });
  }
});

customerRouter.post("/favourites/:astrologerProfileId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { astrologerProfileId } = req.params;

    const existing = await prisma.astrologerFavourite.findUnique({
      where: {
        userId_astrologerProfileId: {
          userId: req.user!.id,
          astrologerProfileId,
        },
      },
    });

    if (existing) {
      await prisma.astrologerFavourite.delete({ where: { id: existing.id } });
      res.status(200).json({ success: true, isFavourite: false, message: "Removed from favourites." });
    } else {
      await prisma.astrologerFavourite.create({
        data: {
          userId: req.user!.id,
          astrologerProfileId,
        },
      });
      res.status(201).json({ success: true, isFavourite: true, message: "Added to favourites." });
    }
  } catch (error) {
    res.status(500).json({ error: "TOGGLE_FAVOURITE_FAILED", message: "Failed to update favourite." });
  }
});

customerRouter.get("/following", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const following = await prisma.astrologerFollower.findMany({
      where: { userId: req.user!.id },
      include: {
        astrologerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      total: following.length,
      following: following.map((f) => ({
        id: f.id,
        astrologer: f.astrologerProfile,
        followedAt: f.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "FOLLOWING_FETCH_FAILED", message: "Failed to retrieve followed astrologers." });
  }
});

customerRouter.post("/following/:astrologerProfileId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { astrologerProfileId } = req.params;

    const existing = await prisma.astrologerFollower.findUnique({
      where: {
        userId_astrologerProfileId: {
          userId: req.user!.id,
          astrologerProfileId,
        },
      },
    });

    if (existing) {
      await prisma.astrologerFollower.delete({ where: { id: existing.id } });
      res.status(200).json({ success: true, isFollowing: false, message: "Unfollowed astrologer." });
    } else {
      await prisma.astrologerFollower.create({
        data: {
          userId: req.user!.id,
          astrologerProfileId,
        },
      });
      res.status(201).json({ success: true, isFollowing: true, message: "Followed astrologer." });
    }
  } catch (error) {
    res.status(500).json({ error: "TOGGLE_FOLLOW_FAILED", message: "Failed to update follow status." });
  }
});

/* ==============================================================================
   SUPPORT TICKETS
============================================================================== */

customerRouter.get("/support/tickets", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { customerId: req.user!.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      total: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ error: "TICKETS_FETCH_FAILED", message: "Failed to fetch support tickets." });
  }
});

const createTicketSchema = z.object({
  category: z.string().min(2).max(64),
  subject: z.string().min(5).max(191),
  description: z.string().min(10).max(3000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  relatedTransactionId: z.string().optional().nullable(),
  relatedConsultationId: z.string().optional().nullable(),
});

customerRouter.post("/support/tickets", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Please provide a valid ticket subject, category and description.",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { category, subject, description, priority, relatedTransactionId, relatedConsultationId } = parsed.data;

    // Generate human-friendly ticket ID: NA-2026-XXXXX
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `NA-TKT-${randomHex}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        customerId: req.user!.id,
        category,
        subject,
        description,
        priority,
        relatedTransactionId,
        relatedConsultationId,
        status: "OPEN",
        messages: {
          create: {
            senderId: req.user!.id,
            senderRole: "CUSTOMER",
            message: description,
          },
        },
      },
      include: { messages: true },
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      error: "TICKET_CREATE_FAILED",
      message: error instanceof Error ? error.message : "Failed to create support ticket.",
    });
  }
});

customerRouter.get("/support/tickets/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        customerId: req.user!.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({ error: "NOT_FOUND", message: "Ticket not found." });
      return;
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: "FETCH_TICKET_FAILED", message: "Failed to fetch ticket." });
  }
});

const replyTicketSchema = z.object({
  message: z.string().min(1).max(3000),
  attachmentUrl: z.string().optional().nullable(),
});

customerRouter.post("/support/tickets/:id/reply", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = replyTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_REQUEST", message: "Message content is required." });
      return;
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: { id, customerId: req.user!.id },
    });

    if (!ticket) {
      res.status(404).json({ error: "NOT_FOUND", message: "Ticket not found." });
      return;
    }

    const message = await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user!.id,
        senderRole: "CUSTOMER",
        message: parsed.data.message,
        attachmentUrl: parsed.data.attachmentUrl,
      },
    });

    // Reopen ticket if closed
    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: "REOPENED", updatedAt: new Date() },
      });
    } else {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { updatedAt: new Date() },
      });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: "REPLY_FAILED", message: "Failed to send reply." });
  }
});

/* ==============================================================================
   NOTIFICATIONS
============================================================================== */

customerRouter.get("/notifications", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ error: "NOTIFICATIONS_FETCH_FAILED", message: "Failed to fetch notifications." });
  }
});

customerRouter.post("/notifications/:id/read", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (error) {
    res.status(500).json({ error: "UPDATE_FAILED", message: "Failed to update notification." });
  }
});

customerRouter.post("/notifications/read-all", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ error: "UPDATE_FAILED", message: "Failed to mark all as read." });
  }
});
