import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { CommissionService } from "../services/commission.service.js";
import { EarningsService } from "../services/earnings.service.js";
import { SettlementService } from "../services/settlement.service.js";
import { AccountingService } from "../services/accounting.service.js";

export const financeRouter = Router();

// Protect all finance routes with Super Admin authorization
financeRouter.use(requireAuth, requireRole("SUPER_ADMIN"));

// 1. Executive Financial Overview & P&L
financeRouter.get("/overview", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await AccountingService.getFinancialOverview();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 2. Commission Management Rules
financeRouter.get("/commission-rules", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceType, isActive } = req.query;
    const rules = await CommissionService.listRules({
      serviceType: serviceType ? String(serviceType) : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
    });
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.post("/commission-rules", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(120),
      code: z.string().min(2).max(64),
      astrologerProfileId: z.string().optional(),
      serviceType: z.enum(["ALL", "CHAT", "AUDIO", "VIDEO", "APPOINTMENT", "LIVE_STREAM"]).default("ALL"),
      commissionType: z.enum(["PERCENTAGE", "FLAT", "SLAB"]).default("PERCENTAGE"),
      commissionBps: z.coerce.number().min(0).max(10000), // e.g. 2000 = 20%
      priority: z.coerce.number().min(1).max(1000).default(100),
      notes: z.string().optional(),
      slabsJson: z.any().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const rule = await CommissionService.createRule({
      ...parsed.data,
      creatorUserId: req.user!.id,
    });

    res.status(201).json({ success: true, message: "Commission rule created successfully", data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.put("/commission-rules/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().optional(),
      commissionBps: z.coerce.number().min(0).max(10000).optional(),
      isActive: z.boolean().optional(),
      priority: z.coerce.number().optional(),
      changeReason: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const updated = await CommissionService.updateRule(req.params.id as string, {
      ...parsed.data,
      changedByUserId: req.user!.id,
    });

    res.json({ success: true, message: "Commission rule updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 3. Admin Withdrawal Approval Queue
financeRouter.get("/withdrawals", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, astrologerProfileId } = req.query;
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(astrologerProfileId ? { astrologerProfileId: String(astrologerProfileId) } : {}),
      },
      include: {
        astrologerProfile: {
          include: {
            user: { select: { fullName: true, email: true, phoneE164: true } },
            bankAccount: true,
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    res.json({
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        requestNumber: w.requestNumber,
        astrologerName: w.astrologerProfile.displayName,
        astrologerEmail: w.astrologerProfile.user.email,
        astrologerPhone: w.astrologerProfile.user.phoneE164,
        amountInr: (Number(w.amountPaise) / 100).toFixed(2),
        tdsAmountInr: (Number(w.tdsAmountPaise) / 100).toFixed(2),
        netAmountInr: (Number(w.netAmountPaise) / 100).toFixed(2),
        status: w.status,
        utrNumber: w.utrNumber,
        rejectionReason: w.rejectionReason,
        bankDetails: w.astrologerProfile.bankAccount
          ? {
              bankName: w.astrologerProfile.bankAccount.bankName,
              accountHolderName: w.astrologerProfile.bankAccount.accountHolderName,
              accountNumberMasked: w.astrologerProfile.bankAccount.accountNumberMasked,
              ifscCode: w.astrologerProfile.bankAccount.ifscCode,
              accountType: w.astrologerProfile.bankAccount.accountType,
              panNumber: w.astrologerProfile.bankAccount.panNumber,
            }
          : null,
        requestedAt: w.requestedAt,
        approvedAt: w.approvedAt,
        processedAt: w.processedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.post("/withdrawals/:id/approve", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const approved = await EarningsService.approveWithdrawal(req.params.id as string, req.user!.id);
    res.json({ success: true, message: "Withdrawal approved for settlement", data: approved });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "APPROVAL_FAILED" });
  }
});

financeRouter.post("/withdrawals/:id/payout", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      utrNumber: z.string().min(4).max(64),
      method: z.string().default("IMPS"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const settled = await EarningsService.settleWithdrawalPaid({
      withdrawalId: req.params.id as string,
      utrNumber: parsed.data.utrNumber,
      processedByUserId: req.user!.id,
    });

    res.json({ success: true, message: "Payout recorded successfully", data: settled });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "PAYOUT_FAILED" });
  }
});

financeRouter.post("/withdrawals/:id/reject", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      reason: z.string().min(3),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const rejected = await EarningsService.rejectWithdrawal({
      withdrawalId: req.params.id as string,
      reason: parsed.data.reason,
      rejectedByUserId: req.user!.id,
    });

    res.json({ success: true, message: "Withdrawal rejected and balance restored", data: rejected });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "REJECTION_FAILED" });
  }
});

// 4. Automated Settlement Batches
financeRouter.get("/settlement-batches", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const batches = await prisma.settlementBatch.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: batches.map((b) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        status: b.status,
        scheduleType: b.scheduleType,
        totalAmountInr: (Number(b.totalAmountPaise) / 100).toFixed(2),
        totalAstrologers: b.totalAstrologers,
        itemCount: b.items.length,
        payoutReference: b.payoutReference,
        createdAt: b.createdAt,
        completedAt: b.completedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.post("/settlement-batches/generate", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scheduleType, notes } = req.body;
    const batch = await SettlementService.generateBatch({
      scheduleType,
      notes,
      approvedByUserId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: `Batch ${batch?.batchNumber} generated with ${batch?.items.length} payouts`,
      data: batch,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "BATCH_GENERATION_FAILED" });
  }
});

financeRouter.post("/settlement-batches/:id/execute", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await SettlementService.executeBatchPayout({
      batchId: req.params.id as string,
      processedByUserId: req.user!.id,
    });

    res.json({
      success: true,
      message: `Batch ${result.batchNumber} payouts executed successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "BATCH_EXECUTION_FAILED" });
  }
});

financeRouter.get("/settlement-batches/:id/export", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const csv = await SettlementService.exportBatchCsv(req.params.id as string);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=batch-${req.params.id}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Operating Expenses Tracking
financeRouter.get("/expenses", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const expenses = await AccountingService.listExpenses({
      category: req.query.category ? String(req.query.category) : undefined,
    });

    res.json({
      success: true,
      data: expenses.map((e) => ({
        id: e.id,
        category: e.category,
        vendor: e.vendor,
        amountInr: (Number(e.amountPaise) / 100).toFixed(2),
        taxAmountInr: (Number(e.taxAmountPaise) / 100).toFixed(2),
        paymentMethod: e.paymentMethod,
        invoiceNumber: e.invoiceNumber,
        expenseDate: e.expenseDate,
        notes: e.notes,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.post("/expenses", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      category: z.enum([
        "INFRASTRUCTURE",
        "AGORA_RTC",
        "FIREBASE",
        "RAZORPAY_GATEWAY",
        "SALARIES",
        "MARKETING",
        "OFFICE",
        "OTHER",
      ]),
      vendor: z.string().min(2),
      amountPaise: z.coerce.number().min(100),
      taxAmountPaise: z.coerce.number().optional().default(0),
      paymentMethod: z.string().default("BANK_TRANSFER"),
      invoiceNumber: z.string().optional(),
      notes: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const expense = await AccountingService.recordExpense({
      ...parsed.data,
      amountPaise: BigInt(parsed.data.amountPaise),
      taxAmountPaise: BigInt(parsed.data.taxAmountPaise),
      approvedByUserId: req.user!.id,
    });

    res.status(201).json({ success: true, message: "Expense recorded successfully", data: expense });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 6. Automated Financial Reconciliation Engine
financeRouter.post("/reconciliation/run", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const report = await AccountingService.runReconciliationCheck(req.user!.id);
    res.json({
      success: true,
      message: `Reconciliation completed: status is ${report.status}`,
      data: {
        id: report.id,
        status: report.status,
        reportDate: report.reportDate,
        totalCollectionsInr: (Number(report.totalCollectionsPaise) / 100).toFixed(2),
        totalCustomerBalancesInr: (Number(report.totalCustomerBalancesPaise) / 100).toFixed(2),
        totalPlatformCommissionInr: (Number(report.totalPlatformCommissionPaise) / 100).toFixed(2),
        totalAstrologerEarningsInr: (Number(report.totalAstrologerEarningsPaise) / 100).toFixed(2),
        totalWithdrawalsPaidInr: (Number(report.totalWithdrawalsPaidPaise) / 100).toFixed(2),
        discrepancyInr: (Number(report.discrepancyAmountPaise) / 100).toFixed(2),
        findings: report.findingsJson,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

financeRouter.get("/reconciliation/history", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = await prisma.reconciliationReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      success: true,
      data: reports.map((r) => ({
        id: r.id,
        status: r.status,
        reportDate: r.reportDate,
        totalCollectionsInr: (Number(r.totalCollectionsPaise) / 100).toFixed(2),
        totalCustomerBalancesInr: (Number(r.totalCustomerBalancesPaise) / 100).toFixed(2),
        totalPlatformCommissionInr: (Number(r.totalPlatformCommissionPaise) / 100).toFixed(2),
        totalAstrologerEarningsInr: (Number(r.totalAstrologerEarningsPaise) / 100).toFixed(2),
        totalWithdrawalsPaidInr: (Number(r.totalWithdrawalsPaidPaise) / 100).toFixed(2),
        discrepancyInr: (Number(r.discrepancyAmountPaise) / 100).toFixed(2),
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});
