import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { PujaService } from "../services/puja.service.js";
import { prisma } from "../db.js";

export const pujaRouter = Router();

// 1. Get Puja Categories
pujaRouter.get("/categories", async (req: Request, res: Response) => {
  try {
    await PujaService.seedStandardCategories();
    const categories = await PujaService.listCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. List Puja Services with Filters
pujaRouter.get("/services", async (req: Request, res: Response) => {
  try {
    const { category, search, templeId, limit, offset } = req.query;
    const result = await PujaService.listServices({
      categorySlug: category as string,
      search: search as string,
      templeId: templeId as string,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0
    });
    res.json({ success: true, data: result.items, total: result.total });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Puja Service Details by Slug
pujaRouter.get("/services/:slug", async (req: Request, res: Response) => {
  try {
    const service = await PujaService.getServiceDetails(req.params.slug as string);
    if (!service) {
      return res.status(404).json({ success: false, error: "PUJA_SERVICE_NOT_FOUND" });
    }
    res.json({ success: true, data: service });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create Puja Booking (Customer)
pujaRouter.post("/bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const {
      pujaServiceId,
      packageId,
      scheduledDate,
      timeSlot,
      sankalpName,
      gotra,
      birthDetails,
      sankalpWish,
      specialInstructions,
      isLiveOnline,
      participants,
      addOnIds
    } = req.body;

    if (!pujaServiceId || !scheduledDate || !timeSlot || !sankalpName) {
      return res.status(400).json({ success: false, error: "MISSING_REQUIRED_BOOKING_FIELDS" });
    }

    const booking = await PujaService.createBooking({
      customerId: userId,
      pujaServiceId,
      packageId,
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      sankalpName,
      gotra,
      birthDetails,
      sankalpWish,
      specialInstructions,
      isLiveOnline: !!isLiveOnline,
      participants,
      addOnIds
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 5. Get Customer's Puja Bookings
pujaRouter.get("/my-bookings", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const bookings = await prisma.pujaBooking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        pujaService: { select: { id: true, name: true, slug: true, coverImageUrl: true } },
        package: { select: { id: true, packageName: true } },
        pandit: { select: { id: true, displayName: true, avatarUrl: true } },
        temple: { select: { id: true, name: true, city: true } }
      }
    });

    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Specific Booking Details
pujaRouter.get("/bookings/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const booking = await prisma.pujaBooking.findUnique({
      where: { id: req.params.id as string },
      include: {
        pujaService: true,
        package: true,
        pandit: true,
        temple: true,
        participants: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: "BOOKING_NOT_FOUND" });
    }

    // Auth check: either customer, assigned pandit, or super admin
    const userRole = (req as any).user.role;
    if (booking.customerId !== userId && userRole !== "SUPER_ADMIN" && (booking as any).pandit?.userId !== userId) {
      return res.status(403).json({ success: false, error: "FORBIDDEN" });
    }

    res.json({ success: true, data: booking });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. List Temples
pujaRouter.get("/temples", async (req: Request, res: Response) => {
  try {
    const temples = await prisma.temple.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
    res.json({ success: true, data: temples });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
