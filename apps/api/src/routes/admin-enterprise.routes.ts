import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { StaffService } from "../services/staff.service.js";
import { CrmService } from "../services/crm.service.js";
import { DisputeService } from "../services/dispute.service.js";
import { AdminCenterService } from "../services/admin-center.service.js";
import { prisma } from "../db.js";

export const adminEnterpriseRouter = Router();

// Ensure SUPER_ADMIN or STAFF authentication for enterprise operations
adminEnterpriseRouter.use(requireAuth);

// ==========================================
// 1. MASTER BUSINESS DASHBOARD & ANALYTICS
// ==========================================

adminEnterpriseRouter.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const metrics = await AdminCenterService.getMasterDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/analytics", async (req: Request, res: Response) => {
  try {
    const analytics = await AdminCenterService.getAnalyticsTimeseries();
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const results = await AdminCenterService.globalSearch(q);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/health", async (req: Request, res: Response) => {
  try {
    const health = await AdminCenterService.getSystemHealth();
    res.json({ success: true, data: health });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. STAFF, DEPARTMENTS & ROLES MANAGEMENT
// ==========================================

adminEnterpriseRouter.get("/staff", async (req: Request, res: Response) => {
  try {
    await StaffService.seedStandardDepartments();
    await StaffService.seedStandardRoles();
    const staff = await StaffService.listStaff(req.query as any);
    res.json({ success: true, data: staff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/staff", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneE164, departmentId, customRoleId, designation, workLocation } = req.body;
    if (!fullName || !email || !phoneE164 || !designation) {
      return res.status(400).json({ success: false, error: "MISSING_REQUIRED_STAFF_FIELDS" });
    }

    const newStaff = await StaffService.createStaff({
      fullName,
      email,
      phoneE164,
      departmentId,
      customRoleId,
      designation,
      workLocation
    });

    res.status(201).json({ success: true, data: newStaff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/departments", async (req: Request, res: Response) => {
  try {
    await StaffService.seedStandardDepartments();
    const depts = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { staff: true, tasks: true } } }
    });
    res.json({ success: true, data: depts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/departments", async (req: Request, res: Response) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, error: "NAME_AND_CODE_REQUIRED" });

    const dept = await prisma.department.create({
      data: { name, code: code.toUpperCase(), description, isActive: true }
    });
    res.status(201).json({ success: true, data: dept });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/roles", async (req: Request, res: Response) => {
  try {
    await StaffService.seedStandardRoles();
    const roles = await prisma.customRole.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { staff: true } } }
    });
    res.json({ success: true, data: roles });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/roles", async (req: Request, res: Response) => {
  try {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, error: "NAME_AND_CODE_REQUIRED" });

    const role = await prisma.customRole.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        permissionsJson: permissions || [],
        isSystem: false
      }
    });
    res.status(201).json({ success: true, data: role });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Tasks
adminEnterpriseRouter.get("/tasks", async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.staffTask.findMany({
      orderBy: { createdAt: "desc" },
      include: { department: true }
    });
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/tasks", async (req: Request, res: Response) => {
  try {
    const createdByUserId = (req as any).user.userId || (req as any).user.id;
    const { title, description, departmentId, assignedToUserId, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ success: false, error: "TITLE_REQUIRED" });

    const task = await StaffService.createTask({
      title,
      description,
      departmentId,
      assignedToUserId,
      createdByUserId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.patch("/tasks/:id/status", async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const task = await StaffService.updateTaskStatus(req.params.id as string, status, notes);
    res.json({ success: true, data: task });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. SALES CRM & LEADS MANAGEMENT
// ==========================================

adminEnterpriseRouter.get("/leads", async (req: Request, res: Response) => {
  try {
    const leads = await CrmService.listLeads(req.query as any);
    res.json({ success: true, data: leads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/leads", async (req: Request, res: Response) => {
  try {
    const { fullName, phoneE164, email, city, interestedService, source, campaign, assignedToUserId, priority, notes } = req.body;
    if (!fullName || !phoneE164) return res.status(400).json({ success: false, error: "NAME_AND_PHONE_REQUIRED" });

    const lead = await CrmService.createLead({
      fullName,
      phoneE164,
      email,
      city,
      interestedService,
      source,
      campaign,
      assignedToUserId,
      priority,
      notes
    });
    res.status(201).json({ success: true, data: lead });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/leads/:id/activity", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { action, notes, newStatus, followupDate } = req.body;

    const result = await CrmService.addActivity({
      leadId: req.params.id as string,
      action: action || "NOTE",
      notes,
      performedByUserId: userId,
      newStatus,
      followupDate: followupDate ? new Date(followupDate) : undefined
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/leads/:id/convert", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const result = await CrmService.convertLead(req.params.id as string, userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. CUSTOMER CRM 360-DEGREE PROFILES
// ==========================================

adminEnterpriseRouter.get("/customers", async (req: Request, res: Response) => {
  try {
    const result = await CrmService.listCustomers(req.query as any);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.get("/customers/:id", async (req: Request, res: Response) => {
  try {
    const customer = await CrmService.getCustomerProfile(req.params.id as string);
    if (!customer) return res.status(404).json({ success: false, error: "CUSTOMER_NOT_FOUND" });
    res.json({ success: true, data: customer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. COMPLAINTS & DISPUTE RESOLUTION
// ==========================================

adminEnterpriseRouter.get("/disputes", async (req: Request, res: Response) => {
  try {
    const disputes = await DisputeService.listComplaints(req.query as any);
    res.json({ success: true, data: disputes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/disputes", async (req: Request, res: Response) => {
  try {
    const { customerId, category, subject, description, evidenceUrls, relatedConsultationId, relatedOrderId, relatedBookingId } = req.body;
    if (!customerId || !subject || !description) {
      return res.status(400).json({ success: false, error: "MISSING_DISPUTE_FIELDS" });
    }

    const dispute = await DisputeService.fileComplaint({
      customerId,
      category,
      subject,
      description,
      evidenceUrls,
      relatedConsultationId,
      relatedOrderId,
      relatedBookingId
    });
    res.status(201).json({ success: true, data: dispute });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/disputes/:id/resolve", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user.id;
    const { decision, investigationNotes, refundAmountInr } = req.body;
    if (!decision) return res.status(400).json({ success: false, error: "DECISION_REQUIRED" });

    const resolved = await DisputeService.resolveDispute({
      complaintId: req.params.id as string,
      decision,
      investigationNotes,
      refundAmountInr: Number(refundAmountInr) || 0,
      approvedByUserId: userId
    });
    res.json({ success: true, data: resolved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. LIVE CONSULTATION OPERATIONS CONTROL
// ==========================================

adminEnterpriseRouter.get("/consultations/live", async (req: Request, res: Response) => {
  try {
    const activeSessions = await prisma.consultationRequest.findMany({
      where: { status: { in: ["WAITING", "ACCEPTED", "ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, fullName: true, phoneE164: true } },
        astrologerProfile: { include: { user: { select: { id: true, fullName: true, phoneE164: true } } } }
      }
    });
    res.json({ success: true, data: activeSessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminEnterpriseRouter.post("/consultations/:id/terminate", async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const updated = await prisma.consultationRequest.update({
      where: { id: req.params.id as string },
      data: {
        status: "CANCELLED",
        rejectionReason: `ADMIN_TERMINATED: ${reason || "Operational review"}`,
        endedAt: new Date()
      }
    });
    res.json({ success: true, data: updated, message: `Consultation terminated by Admin: ${reason || "Operational review"}` });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
