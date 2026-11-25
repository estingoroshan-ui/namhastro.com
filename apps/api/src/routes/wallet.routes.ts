import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { PaymentService } from "../services/payment.service.js";

export const walletRouter = Router();

// 1. Get Recharge Packages
walletRouter.get("/packages", async (req: Request, res: Response) => {
  try {
    const packages = await prisma.rechargePackage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    const formatted = packages.map((pkg) => ({
      id: pkg.id,
      code: pkg.code,
      name: pkg.name,
      amountInr: pkg.amountInr,
      bonusInr: Number(pkg.bonusPaise) / 100,
      totalCreditInr: pkg.amountInr + Number(pkg.bonusPaise) / 100,
      isPopular: pkg.isPopular,
      badgeText: pkg.badgeText,
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 2. Get User Wallet Balance & Ledger Summary
walletRouter.get("/balance", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          currency: "INR",
          paidBalancePaise: BigInt(0),
          promoBalancePaise: BigInt(0),
        },
        include: {
          transactions: true,
        },
      });
    }

    const paidBalancePaise = Number(wallet.paidBalancePaise);
    const promoBalancePaise = Number(wallet.promoBalancePaise);
    const totalBalancePaise = paidBalancePaise + promoBalancePaise;

    const formattedTransactions = wallet.transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amountInr: (Number(tx.amountPaise) / 100).toFixed(2),
      balanceAfterInr: (Number(tx.balanceAfterPaise) / 100).toFixed(2),
      description: tx.description,
      createdAt: tx.createdAt,
    }));

    res.json({
      success: true,
      data: {
        currency: wallet.currency,
        paidBalanceInr: paidBalancePaise / 100,
        promoBalanceInr: promoBalancePaise / 100,
        totalBalanceInr: totalBalancePaise / 100,
        paidBalancePaise,
        promoBalancePaise,
        totalBalancePaise,
        recentTransactions: formattedTransactions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 3. Create Razorpay Payment Order for Recharge
walletRouter.post("/recharge/order", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      amountInr: z.number().int().positive().min(50).max(100000),
      rechargePackageId: z.string().optional(),
      customerGstin: z.string().max(20).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const orderData = await PaymentService.createRechargeOrder({
      userId: req.user!.id,
      amountInr: parsed.data.amountInr,
      rechargePackageId: parsed.data.rechargePackageId,
      customerGstin: parsed.data.customerGstin,
    });

    res.status(201).json({
      success: true,
      message: "Recharge order created successfully",
      data: orderData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "ORDER_CREATION_FAILED", message: error?.message });
  }
});

// 4. Verify Payment & Settle to Wallet
walletRouter.post("/recharge/verify", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const schema = z.object({
      gatewayOrderId: z.string().min(1),
      gatewayPaymentId: z.string().min(1),
      gatewaySignature: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "VALIDATION_FAILED", details: parsed.error.format() });
      return;
    }

    const settlement = await PaymentService.verifyAndCreditPayment({
      gatewayOrderId: parsed.data.gatewayOrderId,
      gatewayPaymentId: parsed.data.gatewayPaymentId,
      gatewaySignature: parsed.data.gatewaySignature,
    });

    res.json({
      success: true,
      message: "Payment verified successfully. Wallet has been credited.",
      data: settlement.data,
    });
  } catch (error: any) {
    console.error("VERIFY_ERROR:", error?.message);
    res.status(400).json({ success: false, error: "PAYMENT_VERIFICATION_FAILED", message: error?.message });
  }
});

// 5. Razorpay Webhook Handler (Server-to-Server)
walletRouter.post("/recharge/webhook", async (req: Request, res: Response) => {
  try {
    const signature = (req.headers["x-razorpay-signature"] as string) || "";
    const result = await PaymentService.handleWebhook(req.body, signature);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: "WEBHOOK_FAILED", message: error?.message });
  }
});

// 6. Complete Paginated Financial Ledger
walletRouter.get("/transactions", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      res.json({ success: true, data: { transactions: [], total: 0, page, limit } });
      return;
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    const formatted = transactions.map((t) => ({
      id: t.id,
      idempotencyKey: t.idempotencyKey,
      type: t.type,
      amountInr: (Number(t.amountPaise) / 100).toFixed(2),
      balanceAfterInr: (Number(t.balanceAfterPaise) / 100).toFixed(2),
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      description: t.description,
      createdAt: t.createdAt,
    }));

    res.json({
      success: true,
      data: {
        transactions: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});

// 7. Get Customer GST Tax Invoices
walletRouter.get("/invoices", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const invoices = await prisma.gstInvoice.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      orderId: inv.orderId,
      customerName: inv.customerName,
      customerGstin: inv.customerGstin,
      sacCode: inv.sacCode,
      taxableAmountInr: (Number(inv.taxableAmountPaise) / 100).toFixed(2),
      cgstInr: (Number(inv.cgstPaise) / 100).toFixed(2),
      sgstInr: (Number(inv.sgstPaise) / 100).toFixed(2),
      totalAmountInr: (Number(inv.totalAmountPaise) / 100).toFixed(2),
      issuedAt: inv.issuedAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: error?.message });
  }
});
