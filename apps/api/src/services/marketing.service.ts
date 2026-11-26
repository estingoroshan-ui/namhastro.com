import { prisma } from "../db.js";

export class MarketingService {
  /**
   * Get or Create Customer Referral Code & Share Link
   */
  static async getOrCreateReferralCode(userId: string) {
    let ref = await prisma.referralCode.findUnique({ where: { userId } });
    if (!ref) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const namePart = (user?.fullName || "NAMH").slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "AST");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const code = `${namePart}${randomCode}`;
      const shareLink = `https://namhastro.com/register?ref=${code}`;

      ref = await prisma.referralCode.create({
        data: {
          userId,
          code,
          shareLink
        }
      });
    }

    const rewards = await prisma.referralReward.findMany({
      where: { referrerUserId: userId },
      include: { referee: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" }
    });

    const totalRewardsPaise = rewards.reduce((acc: bigint, r: any) => acc + (r.status === "APPROVED" ? r.amountPaise : 0n), 0n);

    return {
      referralCode: ref.code,
      shareLink: ref.shareLink,
      timesUsed: ref.timesUsed,
      totalRewardsInr: (Number(totalRewardsPaise) / 100).toFixed(2),
      rewards: rewards.map((r: any) => ({
        id: r.id,
        refereeName: r.referee.fullName,
        amountInr: (Number(r.amountPaise) / 100).toFixed(2),
        status: r.status,
        createdAt: r.createdAt
      }))
    };
  }

  /**
   * Validate & Apply Coupon Code
   */
  static async validateCoupon(params: {
    code: string;
    userId: string;
    orderAmountPaise: bigint;
    serviceType?: string;
  }) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: params.code.trim().toUpperCase() }
    });

    if (!coupon || !coupon.isActive) {
      throw new Error("COUPON_INVALID");
    }

    const now = new Date();
    if (coupon.startDate > now || (coupon.endDate && coupon.endDate < now)) {
      throw new Error("COUPON_EXPIRED");
    }

    if (params.orderAmountPaise < coupon.minOrderAmountPaise) {
      throw new Error(`MINIMUM_ORDER_PAISE_${coupon.minOrderAmountPaise}`);
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      throw new Error("COUPON_USAGE_LIMIT_EXCEEDED");
    }

    // Check per-customer limit
    const customerRedemptions = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId: params.userId }
    });
    if (customerRedemptions >= coupon.perCustomerLimit) {
      throw new Error("COUPON_CUSTOMER_LIMIT_REACHED");
    }

    // Calculate discount
    let discountPaise = 0n;
    if (coupon.discountType === "PERCENTAGE") {
      discountPaise = (params.orderAmountPaise * BigInt(coupon.discountValue)) / 100n;
      if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
        discountPaise = coupon.maxDiscountPaise;
      }
    } else {
      discountPaise = BigInt(coupon.discountValue * 100);
      if (discountPaise > params.orderAmountPaise) {
        discountPaise = params.orderAmountPaise;
      }
    }

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      campaignName: coupon.campaignName,
      discountPaise,
      discountInr: (Number(discountPaise) / 100).toFixed(2),
      finalAmountPaise: params.orderAmountPaise - discountPaise
    };
  }

  /**
   * Seed Standard Marketing Banners if empty
   */
  static async seedStandardBanners() {
    const count = await prisma.banner.count();
    if (count > 0) return;

    const banners = [
      {
        location: "HOMEPAGE_HERO",
        title: "Auspicious Maha Shivaratri Rudrabhishek",
        subtitle: "Live from Kashi Vishwanath with Vedic Purohits · Book with Sankalp",
        ctaText: "Book Sacred Puja",
        ctaUrl: "/puja/rudrabhishek",
        desktopImageUrl: "/images/banner-1.jpg",
        displayOrder: 1
      },
      {
        location: "PUJA_PAGE",
        title: "Vedic Shanti & Dosha Nivaran",
        subtitle: "Overcome Kaal Sarp and Manglik Dosha with Authentic Tantrokta Rituals",
        ctaText: "Explore Dosha Pujas",
        ctaUrl: "/puja",
        desktopImageUrl: "/images/puja-grah-shanti.svg",
        displayOrder: 2
      },
      {
        location: "STORE_PAGE",
        title: "Govt Lab Certified Nepali Rudraksha",
        subtitle: "Energized by Vedic Pandits before Dispatch · 100% Originality Guaranteed",
        ctaText: "Shop Rudraksha",
        ctaUrl: "/store?category=rudraksha",
        desktopImageUrl: "/images/store-rudraksha.svg",
        displayOrder: 3
      }
    ];

    for (const b of banners) {
      await prisma.banner.create({ data: b });
    }
  }

  /**
   * List Active Banners by Location
   */
  static async listBanners(location?: string) {
    const where: any = { isActive: true };
    if (location) where.location = location;

    return prisma.banner.findMany({
      where,
      orderBy: { displayOrder: "asc" }
    });
  }
}
