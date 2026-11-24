import { Router, type Response } from "express";
import { prisma } from "../db.js";

export const astrologersRouter = Router();

astrologersRouter.get("/", async (req, res: Response) => {
  try {
    const {
      q,
      speciality,
      language,
      status,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Filter by approval stage: only APPROVED or ACTIVE astrologers are visible publicly
    const where: any = {
      verificationStage: { in: ["APPROVED", "ACTIVE"] },
    };

    if (status && typeof status === "string") {
      where.availabilityStatus = status.toUpperCase();
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      where.OR = [
        { displayName: { contains: q.trim() } },
        { bio: { contains: q.trim() } },
      ];
    }

    if (minPrice) {
      const minPaise = parseInt(minPrice as string, 10) * 100;
      where.chatRatePaise = { gte: minPaise };
    }

    if (maxPrice) {
      const maxPaise = parseInt(maxPrice as string, 10) * 100;
      where.chatRatePaise = { ...(where.chatRatePaise || {}), lte: maxPaise };
    }

    let orderBy: any = [{ availabilityStatus: "asc" }, { updatedAt: "desc" }];

    if (sort === "price_asc") {
      orderBy = [{ chatRatePaise: "asc" }];
    } else if (sort === "price_desc") {
      orderBy = [{ chatRatePaise: "desc" }];
    } else if (sort === "experience") {
      orderBy = [{ experienceYears: "desc" }];
    }

    const [total, astrologers] = await Promise.all([
      prisma.astrologerProfile.count({ where }),
      prisma.astrologerProfile.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          slug: true,
          displayName: true,
          avatarUrl: true,
          verificationStage: true,
          availabilityStatus: true,
          chatEnabled: true,
          audioEnabled: true,
          videoEnabled: true,
          experienceYears: true,
          chatRatePaise: true,
          audioRatePaise: true,
          videoRatePaise: true,
          bio: true,
          qualifications: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      astrologers: astrologers.map((a) => ({
        id: a.id,
        slug: a.slug,
        name: a.displayName,
        avatarUrl: a.avatarUrl,
        status: a.availabilityStatus,
        verified: a.verificationStage === "ACTIVE" || a.verificationStage === "APPROVED",
        experienceYears: a.experienceYears,
        chatRateInr: a.chatRatePaise / 100,
        audioRateInr: a.audioRatePaise / 100,
        videoRateInr: a.videoRatePaise / 100,
        bio: a.bio,
        qualifications: a.qualifications ? JSON.parse(a.qualifications) : [],
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: "ASTROLOGERS_FETCH_FAILED",
      message: error instanceof Error ? error.message : "Failed to fetch astrologers.",
    });
  }
});

astrologersRouter.get("/:slug", async (req, res: Response) => {
  try {
    const { slug } = req.params;

    const astrologer = await prisma.astrologerProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            preferredLanguage: true,
            createdAt: true,
          },
        },
      },
    });

    if (!astrologer) {
      res.status(404).json({ error: "NOT_FOUND", message: "Astrologer not found." });
      return;
    }

    const followersCount = await prisma.astrologerFollower.count({
      where: { astrologerProfileId: astrologer.id },
    });

    res.status(200).json({
      success: true,
      astrologer: {
        id: astrologer.id,
        slug: astrologer.slug,
        name: astrologer.displayName,
        avatarUrl: astrologer.avatarUrl,
        status: astrologer.availabilityStatus,
        verified: astrologer.verificationStage === "ACTIVE" || astrologer.verificationStage === "APPROVED",
        experienceYears: astrologer.experienceYears,
        chatRateInr: astrologer.chatRatePaise / 100,
        audioRateInr: astrologer.audioRatePaise / 100,
        videoRateInr: astrologer.videoRatePaise / 100,
        bio: astrologer.bio,
        qualifications: astrologer.qualifications ? JSON.parse(astrologer.qualifications) : [],
        followersCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "PROFILE_FETCH_FAILED",
      message: error instanceof Error ? error.message : "Failed to fetch astrologer profile.",
    });
  }
});
