import { prisma } from "./db.js";
import { AuthService } from "./services/auth.service.js";

async function main() {
  console.log("[NAMH ASTRO] Starting database seed...");

  // 1. Seed Super Admin account
  const adminEmail = "admin@namhastro.com";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    const adminPasswordHash = await AuthService.hashPassword("NamhAstro@Admin2026!");
    admin = await prisma.user.create({
      data: {
        fullName: "NAMH ASTRO Super Administrator",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        preferredLanguage: "en",
        wallet: {
          create: {
            currency: "INR",
            paidBalancePaise: BigInt(0),
            promoBalancePaise: BigInt(0),
          },
        },
      },
    });
    console.log(`[NAMH ASTRO] Created Super Admin: ${adminEmail}`);
  }

  // 2. Seed System Settings
  const defaultSettings = [
    {
      key: "marketplace.pricing.first_consultation_rate_inr",
      valueJson: 1,
      description: "Promotional first consultation per-minute rate in INR",
    },
    {
      key: "marketplace.platform_commission_bps",
      valueJson: 2000, // 20% platform commission
      description: "Standard marketplace platform commission in basis points",
    },
    {
      key: "marketplace.call_buffer_seconds",
      valueJson: 60,
      description: "Minimum prepaid consultation buffer required before connecting",
    },
    {
      key: "marketplace.free_kundli_enabled",
      valueJson: true,
      description: "Enable free Janam Kundli generator engine",
    },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: {
        key: s.key,
        valueJson: s.valueJson,
        description: s.description,
        updatedBy: admin.id,
      },
      update: {
        valueJson: s.valueJson,
      },
    });
  }

  // 3. Seed Verified Astrologers
  const astrologersData = [
    {
      name: "Acharya Raghavendra Sharma",
      slug: "acharya-raghavendra-sharma",
      email: "raghavendra@namhastro.com",
      phone: "+919811000001",
      experienceYears: 22,
      chatRateInr: 35,
      audioRateInr: 45,
      videoRateInr: 75,
      status: "ONLINE",
      avatarUrl: "/images/astro-1.svg",
      bio: "Traditional Jyotish Acharya trained in Varanasi with over two decades guiding families on Parashari horoscopy, marriage timing, and spiritual remedies.",
      qualifications: ["Jyotish Acharya, Sampurnanand Sanskrit University", "Vedic Muhurat Specialist"],
    },
    {
      name: "Dr. Meera Kulkarni",
      slug: "dr-meera-kulkarni",
      email: "meera.kulkarni@namhastro.com",
      phone: "+919811000002",
      experienceYears: 14,
      chatRateInr: 30,
      audioRateInr: 40,
      videoRateInr: 65,
      status: "ONLINE",
      avatarUrl: "/images/astro-2.svg",
      bio: "Gold medalist in Vedic Astrology and clinical psychologist integrating classical planetary Dasha analysis with modern life counselling.",
      qualifications: ["Ph.D. in Vedic Astrology, Pune University", "Certified Tarot Master"],
    },
    {
      name: "Pandit Devendra Joshi",
      slug: "pandit-devendra-joshi",
      email: "devendra.joshi@namhastro.com",
      phone: "+919811000003",
      experienceYears: 18,
      chatRateInr: 40,
      audioRateInr: 50,
      videoRateInr: 80,
      status: "ONLINE",
      avatarUrl: "/images/astro-3.svg",
      bio: "Specialist in KP Astrology and Prashna Horary analysis, known for accurate event timing and practical Vedic remedies.",
      qualifications: ["KP Astrology Research Foundation Fellow", "Lal Kitab Scholar"],
    },
    {
      name: "Acharya Ananya Trivedi",
      slug: "acharya-ananya-trivedi",
      email: "ananya.trivedi@namhastro.com",
      phone: "+919811000004",
      experienceYears: 11,
      chatRateInr: 28,
      audioRateInr: 38,
      videoRateInr: 60,
      status: "BUSY",
      avatarUrl: "/images/astro-4.jpg",
      bio: "Renowned relationship astrologer and Vedic compatibility analyst assisting thousands of couples in marriage harmony.",
      qualifications: ["Vedic Jyotish Visharad", "Nadi Astrology Practitioner"],
    },
    {
      name: "Vastu Shiromani Rakesh Shastri",
      slug: "rakesh-shastri@namhastro.com",
      email: "rakesh.shastri@namhastro.com",
      phone: "+919811000005",
      experienceYears: 26,
      chatRateInr: 50,
      audioRateInr: 65,
      videoRateInr: 99,
      status: "ONLINE",
      avatarUrl: "/images/astro-5.svg",
      bio: "Master of Residential and Commercial Vastu Shastra combining structural energy balance with planetary horoscope alignments.",
      qualifications: ["Vastu Shiromani National Awardee", "Vedic Temple Architect Consultant"],
    },
    {
      name: "Siddha Yogini Rajeshwari Devi",
      slug: "rajeshwari-devi@namhastro.com",
      email: "rajeshwari.devi@namhastro.com",
      phone: "+919811000006",
      experienceYears: 16,
      chatRateInr: 32,
      audioRateInr: 42,
      videoRateInr: 70,
      status: "OFFLINE",
      avatarUrl: "/images/astro-6.svg",
      bio: "Intuitive Vedic scholar, gemstone recommendation authority, and spiritual mentor guiding individuals through spiritual transformation.",
      qualifications: ["Gemmology & Ratna Shastra Certified", "M.A. Sanskrit & Jyotish"],
    },
  ];

  for (const ast of astrologersData) {
    let user = await prisma.user.findUnique({ where: { email: ast.email } });
    if (!user) {
      const passwordHash = await AuthService.hashPassword("AstroPass@2026!");
      user = await prisma.user.create({
        data: {
          fullName: ast.name,
          email: ast.email,
          phoneE164: ast.phone,
          passwordHash,
          role: "ASTROLOGER",
          status: "ACTIVE",
          wallet: {
            create: {
              currency: "INR",
              paidBalancePaise: BigInt(0),
              promoBalancePaise: BigInt(0),
            },
          },
          astrologerProfile: {
            create: {
              slug: ast.slug,
              displayName: ast.name,
              verificationStage: "ACTIVE",
              availabilityStatus: ast.status as any,
              chatEnabled: true,
              audioEnabled: true,
              videoEnabled: true,
              experienceYears: ast.experienceYears,
              chatRatePaise: ast.chatRateInr * 100,
              audioRatePaise: ast.audioRateInr * 100,
              videoRatePaise: ast.videoRateInr * 100,
              avatarUrl: ast.avatarUrl,
              bio: ast.bio,
              qualifications: JSON.stringify(ast.qualifications),
            },
          },
        },
      });
      console.log(`[NAMH ASTRO] Seeded verified astrologer: ${ast.name} (${ast.slug})`);
    }
  }

  // 4. Seed Recharge Packages
  const defaultPackages = [
    { code: "RECHARGE_100", name: "Starter Pack", amountInr: 100, bonusPaise: BigInt(0), isPopular: false, displayOrder: 1 },
    { code: "RECHARGE_200", name: "Standard Pack", amountInr: 200, bonusPaise: BigInt(0), isPopular: false, displayOrder: 2 },
    { code: "RECHARGE_500", name: "Most Popular Pack", amountInr: 500, bonusPaise: BigInt(5000), isPopular: true, badgeText: "10% Extra", displayOrder: 3 },
    { code: "RECHARGE_1000", name: "Vedic Wisdom Pack", amountInr: 1000, bonusPaise: BigInt(15000), isPopular: false, badgeText: "15% Extra", displayOrder: 4 },
    { code: "RECHARGE_2000", name: "Premium Devotee Pack", amountInr: 2000, bonusPaise: BigInt(40000), isPopular: false, badgeText: "20% Extra", displayOrder: 5 },
    { code: "RECHARGE_5000", name: "VIP Royal Astro Pack", amountInr: 5000, bonusPaise: BigInt(125000), isPopular: false, badgeText: "25% Extra", displayOrder: 6 },
  ];

  for (const pkg of defaultPackages) {
    const existing = await prisma.rechargePackage.findUnique({ where: { code: pkg.code } });
    if (!existing) {
      await prisma.rechargePackage.create({
        data: {
          code: pkg.code,
          name: pkg.name,
          amountInr: pkg.amountInr,
          amountPaise: BigInt(pkg.amountInr * 100),
          bonusPaise: pkg.bonusPaise,
          isPopular: pkg.isPopular,
          badgeText: pkg.badgeText || null,
          displayOrder: pkg.displayOrder,
        },
      });
      console.log(`[NAMH ASTRO] Seeded recharge package: ${pkg.name} (₹${pkg.amountInr})`);
    }
  }

  console.log("[NAMH ASTRO] Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("[NAMH ASTRO] Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
