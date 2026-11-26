import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { PujaService } from "../services/puja.service.js";
import { StoreService } from "../services/store.service.js";
import { prisma } from "../db.js";

export const adminMarketplaceRouter = Router();

// Require SUPER_ADMIN for all operations in this router
adminMarketplaceRouter.use(requireAuth, requireRole("SUPER_ADMIN"));

// ==========================================
// 1. PUJA SERVICES & PACKAGES
// ==========================================

adminMarketplaceRouter.get("/puja/services", async (req: Request, res: Response) => {
  try {
    const services = await prisma.pujaService.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        temple: true,
        packages: true,
        addOns: true,
        _count: { select: { bookings: true } }
      }
    });
    res.json({ success: true, data: services });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.post("/puja/services", async (req: Request, res: Response) => {
  try {
    const {
      name,
      categoryId,
      shortDescription,
      detailedDescription,
      significance,
      procedure,
      durationMinutes,
      coverImageUrl,
      galleryImages,
      videoUrl,
      templeId,
      regularPricePaise,
      discountedPricePaise,
      bookingCapacity,
      packages,
      addOns
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const service = await prisma.pujaService.create({
      data: {
        name,
        slug,
        categoryId,
        shortDescription: shortDescription || name,
        detailedDescription: detailedDescription || name,
        significance,
        procedure,
        durationMinutes: Number(durationMinutes) || 60,
        coverImageUrl: coverImageUrl || "/images/puja-grah-shanti.svg",
        galleryImagesJson: galleryImages as any,
        videoUrl,
        templeId,
        regularPricePaise: BigInt(regularPricePaise || 510000),
        discountedPricePaise: BigInt(discountedPricePaise || 410000),
        bookingCapacity: Number(bookingCapacity) || 10,
        packages: packages ? {
          create: packages.map((p: any) => ({
            packageName: p.packageName,
            description: p.description,
            pricePaise: BigInt(p.pricePaise || 510000),
            maxParticipants: Number(p.maxParticipants) || 1
          }))
        } : undefined,
        addOns: addOns ? {
          create: addOns.map((a: any) => ({
            name: a.name,
            description: a.description,
            pricePaise: BigInt(a.pricePaise || 50000),
            type: a.type || "SAMAGRI"
          }))
        } : undefined
      },
      include: { packages: true, addOns: true }
    });

    res.status(201).json({ success: true, data: service });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PUJA BOOKINGS MANAGEMENT
// ==========================================

adminMarketplaceRouter.get("/puja/bookings", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const bookings = await prisma.pujaBooking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, phoneE164: true, email: true } },
        pujaService: { select: { name: true, coverImageUrl: true } },
        package: { select: { packageName: true } },
        pandit: { select: { id: true, displayName: true, avatarUrl: true } },
        temple: { select: { name: true, city: true } }
      }
    });

    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.post("/puja/bookings/:id/assign-pandit", async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user.userId || (req as any).user.id;
    const { panditId } = req.body;
    if (!panditId) return res.status(400).json({ success: false, error: "PANDIT_ID_REQUIRED" });

    const updated = await PujaService.assignPandit(req.params.id as string, panditId, adminUserId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. PANDIT APPROVAL & KYC
// ==========================================

adminMarketplaceRouter.get("/pandits", async (req: Request, res: Response) => {
  try {
    const pandits = await prisma.panditProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, phoneE164: true, email: true } },
        temple: { select: { name: true } },
        _count: { select: { bookings: true } }
      }
    });
    res.json({ success: true, data: pandits });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.patch("/pandits/:id/status", async (req: Request, res: Response) => {
  try {
    const { stage } = req.body; // APPROVED, REJECTED, ACTIVE, SUSPENDED
    const pandit = await prisma.panditProfile.update({
      where: { id: req.params.id as string },
      data: {
        verificationStage: stage,
        isAvailable: stage === "ACTIVE" || stage === "APPROVED"
      }
    });
    res.json({ success: true, data: pandit });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. TEMPLE MANAGEMENT
// ==========================================

adminMarketplaceRouter.post("/temples", async (req: Request, res: Response) => {
  try {
    const { name, deity, description, address, city, state, pincode, contactPhone, contactEmail, dailyBookingCapacity, templeTimings } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now().toString().slice(-4)}`;

    const temple = await prisma.temple.create({
      data: {
        name,
        slug,
        deity: deity || "Lord Shiva",
        description,
        address: address || "Temple Road",
        city: city || "Varanasi",
        state: state || "Uttar Pradesh",
        pincode,
        contactPhone,
        contactEmail,
        dailyBookingCapacity: Number(dailyBookingCapacity) || 50,
        templeTimings: templeTimings || "05:00 AM - 09:00 PM",
        isVerified: true,
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: temple });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. STORE PRODUCTS & INVENTORY
// ==========================================

adminMarketplaceRouter.get("/store/products", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true,
        _count: { select: { orderItems: true } }
      }
    });
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.post("/store/products", async (req: Request, res: Response) => {
  try {
    const {
      name,
      categoryId,
      sku,
      brand,
      shortDescription,
      detailedDescription,
      material,
      origin,
      regularPricePaise,
      salePricePaise,
      costPricePaise,
      stockQuantity,
      minStockAlert,
      coverImageUrl,
      isFeatured
    } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + `-${Date.now().toString().slice(-4)}`;
    const productSku = sku || `SKU-${Date.now().toString().slice(-6)}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku: productSku,
        categoryId,
        brand: brand || "NAMH Spiritual",
        shortDescription: shortDescription || name,
        detailedDescription: detailedDescription || name,
        material,
        origin,
        regularPricePaise: BigInt(regularPricePaise || 250000),
        salePricePaise: BigInt(salePricePaise || 199900),
        costPricePaise: BigInt(costPricePaise || 100000),
        stockQuantity: Number(stockQuantity) || 25,
        minStockAlert: Number(minStockAlert) || 5,
        coverImageUrl: coverImageUrl || "/images/store-rudraksha.svg",
        isFeatured: !!isFeatured,
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.post("/store/products/:id/stock-adjustment", async (req: Request, res: Response) => {
  try {
    const adminUserId = (req as any).user.userId || (req as any).user.id;
    const { adjustmentQuantity, reason } = req.body;
    const qty = Number(adjustmentQuantity);

    const updated = await prisma.$transaction(async (tx: any) => {
      const p = await tx.product.update({
        where: { id: req.params.id },
        data: { stockQuantity: { increment: qty } }
      });

      await tx.inventoryMovement.create({
        data: {
          productId: req.params.id,
          type: qty >= 0 ? "INWARD" : "ADJUSTMENT",
          quantity: Math.abs(qty),
          reason: reason || "Manual admin stock adjustment",
          performedByUserId: adminUserId
        }
      });

      return p;
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. STORE ORDERS & SHIPMENTS
// ==========================================

adminMarketplaceRouter.get("/store/orders", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.storeOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, phoneE164: true, email: true } },
        items: true,
        returns: true
      }
    });

    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminMarketplaceRouter.patch("/store/orders/:id/shipment", async (req: Request, res: Response) => {
  try {
    const { status, shippingProvider, awbNumber, trackingUrl } = req.body;
    const updated = await StoreService.updateShipment(req.params.id as string, {
      status,
      shippingProvider,
      awbNumber,
      trackingUrl
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. COUPONS MANAGEMENT
// ==========================================

adminMarketplaceRouter.post("/coupons", async (req: Request, res: Response) => {
  try {
    const { code, campaignName, discountType, discountValue, maxDiscountInr, minOrderAmountInr, usageLimit, perCustomerLimit } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code: (code || "NAMH10").trim().toUpperCase(),
        campaignName: campaignName || "Spiritual Offer",
        discountType: discountType || "PERCENTAGE",
        discountValue: Number(discountValue) || 10,
        maxDiscountPaise: maxDiscountInr ? BigInt(Number(maxDiscountInr) * 100) : null,
        minOrderAmountPaise: minOrderAmountInr ? BigInt(Number(minOrderAmountInr) * 100) : 0n,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perCustomerLimit: Number(perCustomerLimit) || 1,
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. BANNER CMS MANAGEMENT
// ==========================================

adminMarketplaceRouter.post("/banners", async (req: Request, res: Response) => {
  try {
    const { location, title, subtitle, ctaText, ctaUrl, desktopImageUrl, mobileImageUrl, displayOrder } = req.body;

    const banner = await prisma.banner.create({
      data: {
        location: location || "HOMEPAGE_HERO",
        title,
        subtitle,
        ctaText,
        ctaUrl,
        desktopImageUrl: desktopImageUrl || "/images/banner-1.jpg",
        mobileImageUrl,
        displayOrder: Number(displayOrder) || 1,
        isActive: true
      }
    });

    res.status(201).json({ success: true, data: banner });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
