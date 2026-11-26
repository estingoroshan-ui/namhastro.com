import { prisma } from "../db.js";

export class CrmService {
  /**
   * Create Sales Lead
   */
  static async createLead(params: {
    fullName: string;
    phoneE164: string;
    email?: string;
    city?: string;
    interestedService?: string;
    source?: any;
    campaign?: string;
    assignedToUserId?: string;
    priority?: any;
    notes?: string;
    estimatedValueInr?: number;
  }) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const leadNumber = `LEA-${dateStr}-${randomSuffix}`;

    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        fullName: params.fullName,
        phoneE164: params.phoneE164,
        email: params.email,
        city: params.city,
        interestedService: params.interestedService || "Vedic Consultation",
        source: params.source || "WEBSITE_ENQUIRY",
        campaign: params.campaign,
        assignedToUserId: params.assignedToUserId,
        priority: params.priority || "MEDIUM",
        status: params.assignedToUserId ? "ASSIGNED" : "NEW_LEAD",
        notes: params.notes,
        estimatedValuePaise: BigInt((params.estimatedValueInr || 1500) * 100)
      }
    });

    if (params.notes) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          action: "NOTE",
          notes: params.notes,
          performedByUserId: params.assignedToUserId
        }
      });
    }

    return lead;
  }

  /**
   * List Leads with Filtering
   */
  static async listLeads(query?: {
    status?: any;
    priority?: any;
    assignedToUserId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;
    if (query?.assignedToUserId) where.assignedToUserId = query.assignedToUserId;
    if (query?.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { phoneE164: { contains: query.search } },
        { email: { contains: query.search } },
        { leadNumber: { contains: query.search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        take: query?.limit || 50,
        skip: query?.offset || 0,
        orderBy: { createdAt: "desc" },
        include: { activities: { orderBy: { createdAt: "desc" }, take: 5 } }
      })
    ]);

    return { total, items };
  }

  /**
   * Add Lead Activity & Update Status
   */
  static async addActivity(params: {
    leadId: string;
    action: string;
    notes?: string;
    performedByUserId?: string;
    newStatus?: any;
    followupDate?: Date;
  }) {
    return prisma.$transaction(async (tx: any) => {
      const activity = await tx.leadActivity.create({
        data: {
          leadId: params.leadId,
          action: params.action,
          notes: params.notes,
          performedByUserId: params.performedByUserId
        }
      });

      const updateData: any = {};
      if (params.newStatus) updateData.status = params.newStatus;
      if (params.followupDate) updateData.followupDate = params.followupDate;

      const lead = await tx.lead.update({
        where: { id: params.leadId },
        data: updateData,
        include: { activities: true }
      });

      return { lead, activity };
    });
  }

  /**
   * Convert Lead into Customer User Account
   */
  static async convertLead(leadId: string, performedByUserId?: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("LEAD_NOT_FOUND");

    return prisma.$transaction(async (tx: any) => {
      // Find or create customer
      let user = await tx.user.findFirst({
        where: {
          OR: [
            { phoneE164: lead.phoneE164 },
            ...(lead.email ? [{ email: lead.email }] : [])
          ]
        }
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            fullName: lead.fullName,
            phoneE164: lead.phoneE164,
            email: lead.email,
            role: "CUSTOMER",
            status: "ACTIVE"
          }
        });

        // Initialize Promo Wallet
        await tx.wallet.create({
          data: {
            userId: user.id,
            paidBalancePaise: 0n,
            promoBalancePaise: 10000n // ₹100 welcome promo credit
          }
        });
      }

      // Mark lead as CONVERTED
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: "CONVERTED",
          convertedUserId: user.id
        }
      });

      await tx.leadActivity.create({
        data: {
          leadId,
          action: "CONVERTED",
          notes: `Converted to Customer ID ${user.id}`,
          performedByUserId
        }
      });

      const userWithWallet = await tx.user.findUnique({
        where: { id: user.id },
        include: { wallet: true }
      });

      return { lead: updatedLead, user: userWithWallet };
    });
  }

  /**
   * Customer CRM: List All Customers with summary metrics
   */
  static async listCustomers(query?: { search?: string; status?: string; limit?: number; offset?: number }) {
    const where: any = { role: "CUSTOMER" };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { phoneE164: { contains: query.search } },
        { email: { contains: query.search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take: query?.limit || 20,
        skip: query?.offset || 0,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneE164: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          wallet: {
            select: {
              paidBalancePaise: true,
              promoBalancePaise: true
            }
          },
          _count: {
            select: {
              consultationRequests: true,
              pujaBookings: true,
              storeOrders: true,
              supportTickets: true
            }
          }
        }
      })
    ]);

    const formattedItems = items.map(c => ({
      ...c,
      walletBalanceInr: (Number(c.wallet?.paidBalancePaise || 0n) / 100).toFixed(2),
      totalConsultations: c._count.consultationRequests
    }));

    return { total, items: formattedItems, customers: formattedItems };
  }

  /**
   * Customer CRM: Get Full 360-Degree Profile
   */
  static async getCustomerProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        wallet: true,
        birthProfiles: true,
        consultationRequests: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { astrologerProfile: { include: { user: { select: { fullName: true } } } } }
        },
        pujaBookings: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { pujaService: { select: { name: true } } }
        },
        storeOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { items: true }
        },
        supportTickets: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) return null;

    return {
      customer: user,
      summary: {
        walletBalancePaise: (user?.wallet?.paidBalancePaise || 0n).toString(),
        totalConsultations: user?.consultationRequests?.length || 0,
        totalPujaBookings: user?.pujaBookings?.length || 0,
        totalStoreOrders: user?.storeOrders?.length || 0
      },
      consultations: user?.consultationRequests || []
    };
  }
}
