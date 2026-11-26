import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { MarketingService } from "../services/marketing.service.js";

export const marketingRouter = Router();

// 1. Get or Generate Customer Referral Code
marketingRouter.get("/referral", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const referralData = await MarketingService.getOrCreateReferralCode(userId);
    res.json({ success: true, data: referralData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Validate Coupon Code
marketingRouter.post("/coupons/validate", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { code, orderAmountPaise, serviceType } = req.body;

    if (!code || orderAmountPaise === undefined) {
      return res.status(400).json({ success: false, error: "CODE_AND_AMOUNT_REQUIRED" });
    }

    const result = await MarketingService.validateCoupon({
      code,
      userId,
      orderAmountPaise: BigInt(orderAmountPaise),
      serviceType
    });

    res.json({
      success: true,
      data: {
        ...result,
        discountPaise: result.discountPaise.toString(),
        finalAmountPaise: result.finalAmountPaise.toString()
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Get Active Banners
marketingRouter.get("/banners", async (req: Request, res: Response) => {
  try {
    await MarketingService.seedStandardBanners();
    const { location } = req.query;
    const banners = await MarketingService.listBanners(location as string);
    res.json({ success: true, data: banners });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
