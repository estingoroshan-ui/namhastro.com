import { prisma } from "../db.js";
import { RtcService } from "./rtc.service.js";

export class PujaService {
  /**
   * Seed standard Puja Categories if table is empty
   */
  static async seedStandardCategories() {
    const count = await prisma.pujaCategory.count();
    if (count > 0) return;

    const standardCategories = [
      { name: "Maha Mrityunjaya Puja", slug: "maha-mrityunjaya-puja", description: "Potent Vedic ritual for health, longevity and overcoming fear of untimely death." },
      { name: "Rudrabhishek", slug: "rudrabhishek", description: "Sacred bathing of Shiva Lingam with Vedic mantras to invoke Lord Shiva's blessings." },
      { name: "Lakshmi Ganesh Puja", slug: "lakshmi-ganesh-puja", description: "Auspicious invocation for prosperity, wisdom and removal of financial obstacles." },
      { name: "Satyanarayan Katha", slug: "satyanarayan-katha", description: "Traditional narrative prayer to Lord Vishnu for family peace and grace." },
      { name: "Navagraha Shanti Puja", slug: "navagraha-shanti-puja", description: "Pacification of all nine planetary deities to resolve planetary doshas." },
      { name: "Ganesh Puja", slug: "ganesh-puja", description: "Auspicious invocation of Vighnaharta before any new venture or obstacle removal." },
      { name: "Hanuman Puja", slug: "hanuman-puja", description: "Powerful worship for courage, physical vitality, protection and removal of negative energies." },
      { name: "Durga Puja", slug: "durga-puja", description: "Navarna mantra and Chandi path to invoke divine feminine protection and triumph." },
      { name: "Saraswati Puja", slug: "saraswati-puja", description: "Rituals for knowledge, education, creative arts and academic excellence." },
      { name: "Vishnu Puja", slug: "vishnu-puja", description: "Sahasranama recitation and archana for family harmony, virtue and preservation." },
      { name: "Shiva Puja", slug: "shiva-puja", description: "Maha Shivaratri and Pradosham rituals for liberation, peace and inner focus." },
      { name: "Pitra Shanti Puja", slug: "pitra-shanti-puja", description: "Ancestral offerings and tarpan to remove Pitra Dosha and bring peace to forefathers." },
      { name: "Traditional Manglik Shanti Puja", slug: "traditional-manglik-shanti-puja", description: "Kumbh vivah and Mars pacification rituals for marital harmony." },
      { name: "Traditional Kaal Sarp Shanti Puja", slug: "traditional-kaal-sarp-shanti-puja", description: "Trimbakeshwar and Ujjain-style Rahu-Ketu pacification rites." },
      { name: "Griha Pravesh", slug: "griha-pravesh", description: "Sacred housewarming ceremony with Vastu Shanti and Navagraha Havan." },
      { name: "Business Opening Puja", slug: "business-opening-puja", description: "Muhurat invocation with Lakshmi-Kubera puja for prosperous commercial ventures." },
      { name: "Marriage Rituals", slug: "marriage-rituals", description: "Vedic Vivah Sanskar and pre-wedding auspicious homas." },
      { name: "Namkaran Sanskar", slug: "namkaran-sanskar", description: "Traditional baby naming ceremony aligned with Janma Nakshatra syllables." },
      { name: "Mundan Sanskar", slug: "mundan-sanskar", description: "First head shaving Vedic ritual for health, purification and spiritual growth." },
      { name: "Havan and Yagya", slug: "havan-and-yagya", description: "Sacred fire ceremonies with ghee, samagri and targeted Vedic Suktas." },
      { name: "Festival Special Puja", slug: "festival-special-puja", description: "Diwali, Navratri, Janmashtami, Shivaratri and Chhath specific celebrations." },
      { name: "Custom Puja Services", slug: "custom-puja-services", description: "Personalized ritual requirements customized by senior acharyas." }
    ];

    for (let i = 0; i < standardCategories.length; i++) {
      const c = standardCategories[i];
      await prisma.pujaCategory.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          displayOrder: i + 1,
          isActive: true
        }
      });
    }
  }

  /**
   * List Puja Categories
   */
  static async listCategories() {
    return prisma.pujaCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { services: true } }
      }
    });
  }

  /**
   * List Puja Services with Filters
   */
  static async listServices(query: {
    categorySlug?: string;
    search?: string;
    isFeatured?: boolean;
    templeId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { isActive: true };
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }
    if (query.templeId) {
      where.templeId = query.templeId;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { shortDescription: { contains: query.search } },
        { detailedDescription: { contains: query.search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.pujaService.count({ where }),
      prisma.pujaService.findMany({
        where,
        take: query.limit || 20,
        skip: query.offset || 0,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          temple: { select: { id: true, name: true, city: true, state: true } },
          packages: { where: { isActive: true } },
          addOns: { where: { isActive: true } }
        }
      })
    ]);

    return { total, items };
  }

  /**
   * Get Puja Service Details by Slug or ID
   */
  static async getServiceDetails(identifier: string) {
    const service = await prisma.pujaService.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        isActive: true
      },
      include: {
        category: true,
        temple: true,
        packages: { where: { isActive: true } },
        addOns: { where: { isActive: true } }
      }
    });
    return service;
  }

  /**
   * Create Puja Booking
   */
  static async createBooking(params: {
    customerId: string;
    pujaServiceId: string;
    packageId?: string;
    scheduledDate: Date;
    timeSlot: string;
    sankalpName: string;
    gotra?: string;
    birthDetails?: { dob?: string; tob?: string; pob?: string; rashi?: string; nakshatra?: string };
    sankalpWish?: string;
    specialInstructions?: string;
    isLiveOnline?: boolean;
    participants?: Array<{ fullName: string; relationship?: string; gotra?: string }>;
    addOnIds?: string[];
  }) {
    const service = await prisma.pujaService.findUnique({
      where: { id: params.pujaServiceId },
      include: { packages: true, addOns: true }
    });
    if (!service || !service.isActive) {
      throw new Error("PUJA_SERVICE_UNAVAILABLE");
    }

    let basePricePaise = service.discountedPricePaise > 0n ? service.discountedPricePaise : service.regularPricePaise;
    let selectedPackage = null;
    if (params.packageId) {
      selectedPackage = service.packages.find((p: any) => p.id === params.packageId);
      if (selectedPackage) {
        basePricePaise = selectedPackage.pricePaise;
      }
    }

    // Add add-ons pricing
    let addOnsPricePaise = 0n;
    if (params.addOnIds && params.addOnIds.length > 0) {
      const activeAddOns = service.addOns.filter((a: any) => params.addOnIds!.includes(a.id));
      for (const a of activeAddOns) {
        addOnsPricePaise += a.pricePaise;
      }
    }

    const subtotalPaise = basePricePaise + addOnsPricePaise;
    const taxRateBps = service.taxRateBps || 1800; // 18% GST
    const taxAmountPaise = (subtotalPaise * BigInt(taxRateBps)) / 10000n;
    const totalAmountPaise = subtotalPaise + taxAmountPaise;

    // Platform commission (standard 25% on Puja bookings, 75% to Pandit)
    const platformCommissionPaise = (subtotalPaise * 2500n) / 10000n;
    const panditFeePaise = subtotalPaise - platformCommissionPaise;

    // Generate unique booking number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `NA-PUJA-${dateStr}-${randomSuffix}`;

    const booking = await prisma.$transaction(async (tx: any) => {
      const b = await tx.pujaBooking.create({
        data: {
          bookingNumber,
          customerId: params.customerId,
          pujaServiceId: params.pujaServiceId,
          packageId: params.packageId,
          scheduledDate: params.scheduledDate,
          timeSlot: params.timeSlot,
          status: "CONFIRMED", // Auto-confirmed on creation/order
          totalAmountPaise,
          taxAmountPaise,
          panditFeePaise,
          platformCommissionPaise,
          isLiveOnline: !!params.isLiveOnline,
          sankalpName: params.sankalpName,
          gotra: params.gotra,
          birthDetailsJson: params.birthDetails as any,
          sankalpWish: params.sankalpWish,
          specialInstructions: params.specialInstructions,
          agoraChannel: params.isLiveOnline ? `puja_${bookingNumber.toLowerCase().replace(/-/g, "_")}` : null
        }
      });

      // Insert participants if any
      if (params.participants && params.participants.length > 0) {
        for (const p of params.participants) {
          await tx.pujaParticipant.create({
            data: {
              bookingId: b.id,
              fullName: p.fullName,
              relationship: p.relationship,
              gotra: p.gotra
            }
          });
        }
      }

      // Record timeline
      await tx.pujaTimeline.create({
        data: {
          bookingId: b.id,
          status: "CONFIRMED",
          actorId: params.customerId,
          notes: "Puja booking created and confirmed."
        }
      });

      return b;
    });

    return booking;
  }

  /**
   * Assign Pandit to Booking
   */
  static async assignPandit(bookingId: string, panditId: string, adminUserId?: string) {
    const booking = await prisma.pujaBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("BOOKING_NOT_FOUND");

    const pandit = await prisma.panditProfile.findUnique({ where: { id: panditId } });
    if (!pandit) throw new Error("PANDIT_NOT_FOUND");

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.pujaBooking.update({
        where: { id: bookingId },
        data: {
          panditId,
          status: "PANDIT_ASSIGNED"
        }
      });

      await tx.pujaTimeline.create({
        data: {
          bookingId,
          status: "PANDIT_ASSIGNED",
          actorId: adminUserId,
          notes: `Assigned to Pandit ${pandit.displayName}`
        }
      });

      return updated;
    });
  }

  /**
   * Pandit Accepts or Rejects Booking
   */
  static async respondToBooking(bookingId: string, panditProfileId: string, action: "ACCEPT" | "REJECT", reason?: string) {
    const booking = await prisma.pujaBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    if (booking.panditId !== panditProfileId) throw new Error("UNAUTHORIZED_PANDIT");

    const nextStatus = action === "ACCEPT" ? "ACCEPTED" : "CONFIRMED"; // If rejected, back to confirmed queue for reassignment
    const notes = action === "ACCEPT" ? "Booking accepted by Pandit" : `Booking declined: ${reason || "Unavailable"}`;

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.pujaBooking.update({
        where: { id: bookingId },
        data: {
          status: nextStatus,
          panditId: action === "ACCEPT" ? panditProfileId : null
        }
      });

      await tx.pujaTimeline.create({
        data: {
          bookingId,
          status: nextStatus,
          actorId: panditProfileId,
          notes
        }
      });

      return updated;
    });
  }

  /**
   * Start Puja & Generate Agora Live Token
   */
  static async startPuja(bookingId: string, panditProfileId: string) {
    const booking = await prisma.pujaBooking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    if (booking.panditId !== panditProfileId) throw new Error("UNAUTHORIZED_PANDIT");

    let agoraToken = null;
    const channelName = booking.agoraChannel || `puja_${booking.bookingNumber.toLowerCase().replace(/-/g, "_")}`;

    if (booking.isLiveOnline) {
      // Mint Agora token for 4 hours
      agoraToken = RtcService.mintToken({
        channelName,
        uid: 1001,
        role: "publisher",
        expireSeconds: 14400
      });
    }

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.pujaBooking.update({
        where: { id: bookingId },
        data: {
          status: "IN_PROGRESS",
          agoraChannel: channelName,
          agoraToken: agoraToken ? (typeof agoraToken === "string" ? agoraToken : JSON.stringify(agoraToken)) : null
        }
      });

      await tx.pujaTimeline.create({
        data: {
          bookingId,
          status: "IN_PROGRESS",
          actorId: panditProfileId,
          notes: "Puja rituals commenced by Pandit."
        }
      });

      return updated;
    });
  }

  /**
   * Complete Puja Ritual with Evidence & Credit Pandit
   */
  static async completePuja(params: {
    bookingId: string;
    panditProfileId: string;
    completionNotes: string;
    photos?: string[];
    videoUrl?: string;
    prasadShipped?: boolean;
    prasadTrackingNumber?: string;
  }) {
    const booking = await prisma.pujaBooking.findUnique({
      where: { id: params.bookingId },
      include: { pandit: true }
    });
    if (!booking) throw new Error("BOOKING_NOT_FOUND");
    if (booking.panditId !== params.panditProfileId) throw new Error("UNAUTHORIZED_PANDIT");

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.pujaBooking.update({
        where: { id: params.bookingId },
        data: {
          status: "COMPLETED",
          completionNotes: params.completionNotes,
          photosJson: params.photos as any,
          videoUrl: params.videoUrl,
          prasadShipped: !!params.prasadShipped,
          prasadTrackingNumber: params.prasadTrackingNumber
        }
      });

      // Increment pandit completed pujas
      await tx.panditProfile.update({
        where: { id: params.panditProfileId },
        data: { totalPujasCompleted: { increment: 1 } }
      });

      // Record timeline
      await tx.pujaTimeline.create({
        data: {
          bookingId: params.bookingId,
          status: "COMPLETED",
          actorId: params.panditProfileId,
          notes: `Rituals successfully accomplished. ${params.photos ? params.photos.length : 0} evidence photos uploaded.`
        }
      });

      return updated;
    });
  }
}
