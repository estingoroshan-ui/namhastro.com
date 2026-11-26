import { prisma } from "../db.js";

export class StaffService {
  /**
   * Seed standard departments if none exist
   */
  static async seedStandardDepartments() {
    const count = await prisma.department.count();
    if (count > 0) return;

    const standardDepts = [
      { name: "Executive Management", code: "MANAGEMENT", description: "Business leadership & strategy" },
      { name: "Sales & Growth", code: "SALES", description: "Inbound leads, outbound campaigns & customer acquisition" },
      { name: "Customer Support & Care", code: "CUSTOMER_SUPPORT", description: "24/7 helpdesk, ticket resolution & devotee relations" },
      { name: "Astrologer Operations", code: "ASTROLOGER_OPS", description: "Astrologer onboarding, verification & availability" },
      { name: "Puja & Pandit Operations", code: "PUJA_OPS", description: "Pandit coordination, temple logistics & live rooms" },
      { name: "Finance & Accounts", code: "FINANCE", description: "Ledger accounting, reconciliations, GST, TDS & payouts" },
      { name: "Marketing & Content", code: "MARKETING", description: "Campaigns, referrals, coupons, push alerts & CMS" },
      { name: "E-commerce & Inventory", code: "ECOMMERCE", description: "Astro Store catalog, warehouse stock & shipping" },
      { name: "Technical Support", code: "TECH_SUPPORT", description: "Agora RTC, WebSockets, database & platform stability" }
    ];

    for (const d of standardDepts) {
      await prisma.department.upsert({
        where: { code: d.code },
        update: {},
        create: {
          name: d.name,
          code: d.code,
          description: d.description,
          isActive: true
        }
      });
    }
  }

  /**
   * Seed standard custom roles & granular permissions
   */
  static async seedStandardRoles() {
    const count = await prisma.customRole.count();
    if (count > 0) return;

    const standardRoles = [
      {
        name: "Business Owner",
        code: "BUSINESS_OWNER",
        description: "Full enterprise ownership with irrevocable administrative access",
        permissions: ["*"],
        isSystem: true
      },
      {
        name: "Super Administrator",
        code: "SUPER_ADMIN",
        description: "Complete operational management across all departments",
        permissions: [
          "customer:view", "customer:edit", "customer:suspend",
          "astrologer:view", "astrologer:approve", "astrologer:rates",
          "staff:view", "staff:create", "staff:edit", "staff:roles",
          "finance:view", "finance:payout_approve", "finance:refund",
          "puja:manage", "store:manage", "cms:manage", "audit:view"
        ],
        isSystem: true
      },
      {
        name: "Operations Manager",
        code: "OPERATIONS_MANAGER",
        description: "Oversees live calling, consultation dispute review, and daily SLAs",
        permissions: ["customer:view", "astrologer:view", "consultation:monitor", "consultation:resolve", "ticket:manage"]
      },
      {
        name: "Finance Manager",
        code: "FINANCE_MANAGER",
        description: "Manages settlements, financial ledger, withdrawals & GST reports",
        permissions: ["finance:view", "finance:payout_initiate", "finance:payout_approve", "finance:refund", "audit:view"]
      },
      {
        name: "Sales Executive",
        code: "SALES_EXECUTIVE",
        description: "Lead management, outbound devotee consultation and follow-ups",
        permissions: ["lead:view", "lead:create", "lead:edit", "lead:convert"]
      },
      {
        name: "Customer Support Executive",
        code: "SUPPORT_EXECUTIVE",
        description: "Resolves helpdesk tickets, consultation quality inquiries and live chat disputes",
        permissions: ["ticket:view", "ticket:create", "ticket:reply", "ticket:escalate", "customer:view"]
      },
      {
        name: "Puja & Pandit Coordinator",
        code: "PANDIT_COORDINATOR",
        description: "Coordinates temple pujas, assigns priests, and monitors completion proof",
        permissions: ["puja:view", "puja:manage", "pandit:view", "pandit:assign"]
      }
    ];

    for (const r of standardRoles) {
      await prisma.customRole.upsert({
        where: { code: r.code },
        update: {},
        create: {
          name: r.name,
          code: r.code,
          description: r.description,
          permissionsJson: r.permissions as any,
          isSystem: !!r.isSystem
        }
      });
    }
  }

  /**
   * Create a new Staff member with profile, department and role
   */
  static async createStaff(params: {
    fullName: string;
    email: string;
    phoneE164: string;
    departmentId?: string;
    customRoleId?: string;
    designation: string;
    workLocation?: string;
    reportingManagerId?: string;
  }) {
    // Generate unique employee ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const employeeId = `EMP-NAMH-${randomSuffix}`;

    return prisma.$transaction(async (tx: any) => {
      // 1. Create User account with role STAFF
      let user = await tx.user.findFirst({
        where: { OR: [{ email: params.email }, { phoneE164: params.phoneE164 }] }
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            fullName: params.fullName,
            email: params.email,
            phoneE164: params.phoneE164,
            role: "STAFF",
            status: "ACTIVE"
          }
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: { role: "STAFF", status: "ACTIVE" }
        });
      }

      // 2. Create Staff Profile
      const staffProfile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          employeeId,
          departmentId: params.departmentId,
          customRoleId: params.customRoleId,
          designation: params.designation,
          workLocation: params.workLocation || "HQ_VARANASI",
          reportingManagerId: params.reportingManagerId,
          isActive: true
        },
        include: {
          user: { select: { id: true, fullName: true, email: true, phoneE164: true, role: true } },
          department: true,
          customRole: true
        }
      });

      return staffProfile;
    });
  }

  /**
   * List staff members with filters
   */
  static async listStaff(query?: { departmentId?: string; status?: string; search?: string }) {
    const where: any = {};
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.status) where.isActive = query.status === "ACTIVE";
    if (query?.search) {
      where.OR = [
        { designation: { contains: query.search } },
        { employeeId: { contains: query.search } },
        { user: { fullName: { contains: query.search } } },
        { user: { email: { contains: query.search } } }
      ];
    }

    return prisma.staffProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, email: true, phoneE164: true, role: true, status: true, lastLoginAt: true } },
        department: true,
        customRole: true
      }
    });
  }

  /**
   * Create a Department Staff Task
   */
  static async createTask(params: {
    title: string;
    description?: string;
    departmentId?: string;
    assignedToUserId?: string;
    createdByUserId: string;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    dueDate?: Date;
  }) {
    const randomTaskSuffix = Math.floor(1000 + Math.random() * 9000);
    const taskNumber = `TSK-${randomTaskSuffix}`;

    const task = await prisma.staffTask.create({
      data: {
        taskNumber,
        title: params.title,
        description: params.description,
        departmentId: params.departmentId,
        assignedToUserId: params.assignedToUserId,
        createdByUserId: params.createdByUserId,
        priority: params.priority || "NORMAL",
        status: "PENDING",
        dueDate: params.dueDate
      },
      include: { department: true }
    });

    return { ...task, taskCode: task.taskNumber };
  }

  /**
   * Update Task Status
   */
  static async updateTaskStatus(taskId: string, status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "UNDER_REVIEW" | "COMPLETED" | "CANCELLED", notes?: string) {
    return prisma.staffTask.update({
      where: { id: taskId },
      data: {
        status,
        internalNotes: notes,
        completedAt: status === "COMPLETED" ? new Date() : undefined
      }
    });
  }
}
