import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { PujaService } from "../services/puja.service.js";
import { prisma } from "../db.js";

export const panditRouter = Router();

// 1. Pandit Application Onboarding
panditRouter.post("/apply", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const {
      displayName,
      experienceYears,
      languages,
      specialisations,
      serviceLocations,
      templeId,
      idVerificationDocUrl,
      qualificationDocs
    } = req.body;

    if (!displayName) {
      return res.status(400).json({ success: false, error: "DISPLAY_NAME_REQUIRED" });
    }

    const slug = displayName.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const profile = await prisma.panditProfile.upsert({
      where: { userId },
      update: {
        displayName,
        experienceYears: Number(experienceYears) || 5,
        languagesJson: languages as any,
        specialisationsJson: specialisations as any,
        serviceLocationsJson: serviceLocations as any,
        templeId,
        idVerificationDocUrl,
        qualificationDocsJson: qualificationDocs as any,
        verificationStage: "APPLIED"
      },
      create: {
        userId,
        displayName,
        slug,
        experienceYears: Number(experienceYears) || 5,
        languagesJson: languages as any,
        specialisationsJson: specialisations as any,
        serviceLocationsJson: serviceLocations as any,
        templeId,
        idVerificationDocUrl,
        qualificationDocsJson: qualificationDocs as any,
        verificationStage: "APPLIED"
      }
    });

    // Update user role to PANDIT
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PANDIT" }
    });

    res.status(201).json({ success: true, data: profile });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Pandit Partner Dashboard Data
panditRouter.get("/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const pandit = await prisma.panditProfile.findUnique({
      where: { userId },
      include: { temple: true }
    });

    if (!pandit) {
      return res.status(404).json({ success: false, error: "PANDIT_PROFILE_NOT_FOUND" });
    }

    const [upcomingBookings, completedBookings] = await Promise.all([
      prisma.pujaBooking.findMany({
        where: {
          panditId: pandit.id,
          status: { in: ["PANDIT_ASSIGNED", "ACCEPTED", "SCHEDULED", "IN_PROGRESS"] }
        },
        orderBy: { scheduledDate: "asc" },
        include: {
          pujaService: { select: { name: true, durationMinutes: true, coverImageUrl: true } },
          customer: { select: { fullName: true, phoneE164: true } }
        }
      }),
      prisma.pujaBooking.findMany({
        where: { panditId: pandit.id, status: "COMPLETED" },
        take: 10,
        orderBy: { scheduledDate: "desc" },
        include: {
          pujaService: { select: { name: true } },
          customer: { select: { fullName: true } }
        }
      })
    ]);

    // Calculate earnings summary
    const completedTotalPaise = completedBookings.reduce((acc: bigint, b: any) => acc + b.panditFeePaise, 0n);

    res.json({
      success: true,
      data: {
        profile: pandit,
        stats: {
          totalCompleted: pandit.totalPujasCompleted,
          totalEarningsInr: (Number(completedTotalPaise) / 100).toFixed(2),
          rating: Number(pandit.averageRating),
          pendingRequestsCount: upcomingBookings.filter((b: any) => b.status === "PANDIT_ASSIGNED").length
        },
        upcomingBookings,
        recentCompletedBookings: completedBookings
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Accept or Reject Booking
panditRouter.post("/bookings/:id/respond", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const pandit = await prisma.panditProfile.findUnique({ where: { userId } });
    if (!pandit) return res.status(404).json({ success: false, error: "PANDIT_NOT_FOUND" });

    const { action, reason } = req.body;
    if (action !== "ACCEPT" && action !== "REJECT") {
      return res.status(400).json({ success: false, error: "ACTION_MUST_BE_ACCEPT_OR_REJECT" });
    }

    const updated = await PujaService.respondToBooking(req.params.id as string, pandit.id, action, reason);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Start Live Puja Session
panditRouter.post("/bookings/:id/start", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const pandit = await prisma.panditProfile.findUnique({ where: { userId } });
    if (!pandit) return res.status(404).json({ success: false, error: "PANDIT_NOT_FOUND" });

    const updated = await PujaService.startPuja(req.params.id as string, pandit.id);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Complete Puja Ritual with Evidence
panditRouter.post("/bookings/:id/complete", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const pandit = await prisma.panditProfile.findUnique({ where: { userId } });
    if (!pandit) return res.status(404).json({ success: false, error: "PANDIT_NOT_FOUND" });

    const { completionNotes, photos, videoUrl, prasadShipped, prasadTrackingNumber } = req.body;
    if (!completionNotes) {
      return res.status(400).json({ success: false, error: "COMPLETION_NOTES_REQUIRED" });
    }

    const updated = await PujaService.completePuja({
      bookingId: req.params.id as string,
      panditProfileId: pandit.id,
      completionNotes,
      photos,
      videoUrl,
      prasadShipped,
      prasadTrackingNumber
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
