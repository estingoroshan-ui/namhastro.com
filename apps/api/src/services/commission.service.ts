import { prisma } from "../db.js";

export interface CommissionResolution {
  commissionBps: number;
  commissionPercent: number;
  platformSharePaise: bigint;
  astrologerSharePaise: bigint;
  ruleCode: string;
  ruleName: string;
}

export class CommissionService {
  /**
   * Resolves the authoritative commission rate for a consultation or service transaction.
   * Precedence:
   * 1. Individual Astrologer Rule / Override (commissionBpsOverride on profile or rule matching astrologerProfileId)
   * 2. Service Type Rule (rule matching serviceType e.g. "CHAT", "AUDIO", "VIDEO")
   * 3. Global Platform Rule (rule with code "GLOBAL_DEFAULT" or serviceType "ALL")
   * 4. Hardcoded Fallback: 2000 bps (20% platform, 80% astrologer)
   */
  static async resolveCommission(params: {
    astrologerProfileId: string;
    serviceType: string;
    amountPaise: bigint;
  }): Promise<CommissionResolution> {
    const { astrologerProfileId, serviceType, amountPaise } = params;

    // 1. Check profile override directly
    const profile = await prisma.astrologerProfile.findUnique({
      where: { id: astrologerProfileId },
      select: { commissionBpsOverride: true, displayName: true },
    });

    if (profile?.commissionBpsOverride !== null && profile?.commissionBpsOverride !== undefined) {
      const bps = profile.commissionBpsOverride;
      const platformSharePaise = (amountPaise * BigInt(bps)) / 10000n;
      const astrologerSharePaise = amountPaise - platformSharePaise;
      return {
        commissionBps: bps,
        commissionPercent: bps / 100,
        platformSharePaise,
        astrologerSharePaise,
        ruleCode: `PROFILE_OVERRIDE_${astrologerProfileId}`,
        ruleName: `Custom Rate: ${profile.displayName} (${(bps / 100).toFixed(1)}%)`,
      };
    }

    // 2. Query active CommissionRules
    const rules = await prisma.commissionRule.findMany({
      where: {
        isActive: true,
        OR: [
          { astrologerProfileId },
          { serviceType },
          { serviceType: "ALL" },
          { code: "GLOBAL_DEFAULT" },
        ],
      },
      orderBy: { priority: "asc" }, // Lower number = higher priority
    });

    // 2a. Astrologer specific rule
    const astroRule = rules.find((r) => r.astrologerProfileId === astrologerProfileId);
    if (astroRule) {
      const bps = astroRule.commissionBps;
      const platformSharePaise = (amountPaise * BigInt(bps)) / 10000n;
      const astrologerSharePaise = amountPaise - platformSharePaise;
      return {
        commissionBps: bps,
        commissionPercent: bps / 100,
        platformSharePaise,
        astrologerSharePaise,
        ruleCode: astroRule.code,
        ruleName: astroRule.name,
      };
    }

    // 2b. Service type rule
    const serviceRule = rules.find((r) => r.serviceType === serviceType);
    if (serviceRule) {
      const bps = serviceRule.commissionBps;
      const platformSharePaise = (amountPaise * BigInt(bps)) / 10000n;
      const astrologerSharePaise = amountPaise - platformSharePaise;
      return {
        commissionBps: bps,
        commissionPercent: bps / 100,
        platformSharePaise,
        astrologerSharePaise,
        ruleCode: serviceRule.code,
        ruleName: serviceRule.name,
      };
    }

    // 2c. Global rule
    const globalRule = rules.find((r) => r.code === "GLOBAL_DEFAULT" || r.serviceType === "ALL");
    if (globalRule) {
      const bps = globalRule.commissionBps;
      const platformSharePaise = (amountPaise * BigInt(bps)) / 10000n;
      const astrologerSharePaise = amountPaise - platformSharePaise;
      return {
        commissionBps: bps,
        commissionPercent: bps / 100,
        platformSharePaise,
        astrologerSharePaise,
        ruleCode: globalRule.code,
        ruleName: globalRule.name,
      };
    }

    // Fallback default: 20%
    const defaultBps = 2000;
    const platformSharePaise = (amountPaise * BigInt(defaultBps)) / 10000n;
    const astrologerSharePaise = amountPaise - platformSharePaise;
    return {
      commissionBps: defaultBps,
      commissionPercent: 20.0,
      platformSharePaise,
      astrologerSharePaise,
      ruleCode: "SYSTEM_DEFAULT_20",
      ruleName: "System Standard Commission (20%)",
    };
  }

  /**
   * List all commission rules with optional filtering
   */
  static async listRules(params?: { serviceType?: string; isActive?: boolean }) {
    return prisma.commissionRule.findMany({
      where: {
        ...(params?.serviceType ? { serviceType: params.serviceType } : {}),
        ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
      },
      include: {
        auditLogs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Create a new commission rule with audit trail
   */
  static async createRule(params: {
    name: string;
    code: string;
    astrologerProfileId?: string;
    serviceType?: string;
    commissionType?: string;
    commissionBps: number;
    slabsJson?: any;
    priority?: number;
    creatorUserId?: string;
    notes?: string;
  }) {
    const rule = await prisma.commissionRule.create({
      data: {
        name: params.name,
        code: params.code,
        astrologerProfileId: params.astrologerProfileId || null,
        serviceType: params.serviceType || "ALL",
        commissionType: params.commissionType || "PERCENTAGE",
        commissionBps: params.commissionBps,
        slabsJson: params.slabsJson || null,
        priority: params.priority || 100,
        isActive: true,
      },
    });

    await prisma.commissionAuditLog.create({
      data: {
        ruleId: rule.id,
        previousBps: 0,
        newBps: params.commissionBps,
        changedByUserId: params.creatorUserId || null,
        changeReason: params.notes || "Initial rule creation",
      },
    });

    return rule;
  }

  /**
   * Update an existing commission rule with audit trail
   */
  static async updateRule(
    id: string,
    params: {
      name?: string;
      commissionBps?: number;
      isActive?: boolean;
      priority?: number;
      changedByUserId?: string;
      changeReason?: string;
    }
  ) {
    const existing = await prisma.commissionRule.findUniqueOrThrow({ where: { id } });

    const updated = await prisma.commissionRule.update({
      where: { id },
      data: {
        ...(params.name ? { name: params.name } : {}),
        ...(params.commissionBps !== undefined ? { commissionBps: params.commissionBps } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
        ...(params.priority !== undefined ? { priority: params.priority } : {}),
      },
    });

    if (params.commissionBps !== undefined && params.commissionBps !== existing.commissionBps) {
      await prisma.commissionAuditLog.create({
        data: {
          ruleId: id,
          previousBps: existing.commissionBps,
          newBps: params.commissionBps,
          changedByUserId: params.changedByUserId || null,
          changeReason: params.changeReason || "Admin rate update",
        },
      });
    }

    return updated;
  }
}
