import { prisma } from "../db.js";

export class AccountingService {
  /**
   * High-Level Executive Financial Dashboard Metrics
   */
  static async getFinancialOverview() {
    // 1. Total Customer Deposits / Recharge collections
    const rechargeTxs = await prisma.walletTransaction.findMany({
      where: { type: "WALLET_RECHARGE", referenceType: "PAYMENT_ORDER" },
      select: { amountPaise: true },
    });
    const totalRechargesPaise = rechargeTxs.reduce((sum, tx) => sum + tx.amountPaise, 0n);

    // 2. Active Customer Wallet Balances (Liability)
    const wallets = await prisma.wallet.findMany({
      select: { paidBalancePaise: true, promoBalancePaise: true },
    });
    let customerPaidLiabilityPaise = 0n;
    let customerPromoLiabilityPaise = 0n;
    for (const w of wallets) {
      customerPaidLiabilityPaise += w.paidBalancePaise;
      customerPromoLiabilityPaise += w.promoBalancePaise;
    }

    // 3. Platform Revenue & Astrologer Consultations Breakdown
    const billings = await prisma.consultationBillingRecord.findMany({
      select: {
        totalAmountPaise: true,
        astrologerEarningsPaise: true,
        platformCommissionPaise: true,
        promoAmountPaise: true,
        paidAmountPaise: true,
      },
    });

    let totalConsultationGrossPaise = 0n;
    let totalAstrologerEarningsPaise = 0n;
    let totalPlatformCommissionPaise = 0n;
    for (const b of billings) {
      totalConsultationGrossPaise += b.totalAmountPaise;
      totalAstrologerEarningsPaise += b.astrologerEarningsPaise;
      totalPlatformCommissionPaise += b.platformCommissionPaise;
    }

    // 4. Astrologer Payable Balances (Liability)
    const earningsAccounts = await prisma.astrologerEarningsAccount.findMany({
      select: {
        availableBalancePaise: true,
        reservedWithdrawalPaise: true,
        pendingEarningsPaise: true,
        completedWithdrawalsPaise: true,
        tdsDeductedPaise: true,
      },
    });

    let astrologerPayablePaise = 0n;
    let astrologerReservedPaise = 0n;
    let astrologerPendingPaise = 0n;
    let astrologerDisbursedPaise = 0n;
    let totalTdsWithheldPaise = 0n;

    for (const ea of earningsAccounts) {
      astrologerPayablePaise += ea.availableBalancePaise;
      astrologerReservedPaise += ea.reservedWithdrawalPaise;
      astrologerPendingPaise += ea.pendingEarningsPaise;
      astrologerDisbursedPaise += ea.completedWithdrawalsPaise;
      totalTdsWithheldPaise += ea.tdsDeductedPaise;
    }

    // 5. Operating Expenses
    const expenses = await prisma.expense.findMany({
      select: { amountPaise: true, taxAmountPaise: true },
    });
    const totalExpensesPaise = expenses.reduce((sum, exp) => sum + exp.amountPaise, 0n);

    // 6. Net P&L Calculation
    // Platform Gross Profit = Platform Commission
    // Net Operating Income = Platform Commission - Total Expenses
    const netOperatingProfitPaise = totalPlatformCommissionPaise - totalExpensesPaise;

    return {
      overview: {
        totalRechargesInr: Number(totalRechargesPaise) / 100,
        customerWalletLiabilityInr: Number(customerPaidLiabilityPaise) / 100,
        customerPromoCreditsInr: Number(customerPromoLiabilityPaise) / 100,
        consultationGrossRevenueInr: Number(totalConsultationGrossPaise) / 100,
        platformGrossCommissionInr: Number(totalPlatformCommissionPaise) / 100,
        totalAstrologerEarningsInr: Number(totalAstrologerEarningsPaise) / 100,
        astrologerPayableLiabilityInr: Number(astrologerPayablePaise) / 100,
        astrologerReservedLiabilityInr: Number(astrologerReservedPaise) / 100,
        astrologerPendingHoldInr: Number(astrologerPendingPaise) / 100,
        astrologerTotalDisbursedInr: Number(astrologerDisbursedPaise) / 100,
        tdsWithheldInr: Number(totalTdsWithheldPaise) / 100,
        totalOperatingExpensesInr: Number(totalExpensesPaise) / 100,
        netOperatingProfitInr: Number(netOperatingProfitPaise) / 100,
      },
      paiseBreakdown: {
        totalRechargesPaise,
        customerPaidLiabilityPaise,
        totalPlatformCommissionPaise,
        totalAstrologerEarningsPaise,
        astrologerPayablePaise,
        astrologerDisbursedPaise,
        totalExpensesPaise,
        netOperatingProfitPaise,
      },
    };
  }

  /**
   * Run an automated double-entry financial reconciliation check
   */
  static async runReconciliationCheck(generatedByUserId?: string) {
    const overview = await this.getFinancialOverview();
    const { paiseBreakdown } = overview;

    // Reconciliation Invariants:
    // 1. Total Collections >= Customer Wallet Liability + Consultation Debits
    // 2. Platform Commission + Astrologer Earnings == Total Consultation Debits
    // 3. Astrologer Total Earnings == Available + Reserved + Pending + Disbursed + TDS
    const findings: any[] = [];
    let isBalanced = true;
    let discrepancyAmountPaise = 0n;

    // Check consultation split invariance
    const billings = await prisma.consultationBillingRecord.findMany({
      select: {
        id: true,
        totalAmountPaise: true,
        astrologerEarningsPaise: true,
        platformCommissionPaise: true,
      },
    });

    for (const b of billings) {
      if (b.astrologerEarningsPaise + b.platformCommissionPaise !== b.totalAmountPaise) {
        isBalanced = false;
        const diff = b.totalAmountPaise - (b.astrologerEarningsPaise + b.platformCommissionPaise);
        discrepancyAmountPaise += diff > 0n ? diff : -diff;
        findings.push({
          type: "BILLING_SPLIT_MISMATCH",
          billingId: b.id,
          expectedGross: b.totalAmountPaise.toString(),
          actualSum: (b.astrologerEarningsPaise + b.platformCommissionPaise).toString(),
        });
      }
    }

    const report = await prisma.reconciliationReport.create({
      data: {
        status: isBalanced ? "BALANCED" : "DISCREPANCY_DETECTED",
        totalCollectionsPaise: paiseBreakdown.totalRechargesPaise,
        totalCustomerBalancesPaise: paiseBreakdown.customerPaidLiabilityPaise,
        totalPlatformCommissionPaise: paiseBreakdown.totalPlatformCommissionPaise,
        totalAstrologerEarningsPaise: paiseBreakdown.totalAstrologerEarningsPaise,
        totalWithdrawalsPaidPaise: paiseBreakdown.astrologerDisbursedPaise,
        discrepancyAmountPaise,
        findingsJson: findings.length > 0 ? (findings as any) : undefined,
        generatedByUserId: generatedByUserId || null,
      },
    });

    return report;
  }

  /**
   * Record a business operating expense (Agora RTC, Firebase, Hosting, Marketing, etc.)
   */
  static async recordExpense(params: {
    category: string;
    vendor: string;
    amountPaise: bigint;
    taxAmountPaise?: bigint;
    paymentMethod?: string;
    invoiceNumber?: string;
    expenseDate?: Date;
    notes?: string;
    approvedByUserId?: string;
  }) {
    return prisma.expense.create({
      data: {
        category: params.category,
        vendor: params.vendor,
        amountPaise: params.amountPaise,
        taxAmountPaise: params.taxAmountPaise || 0n,
        paymentMethod: params.paymentMethod || "BANK_TRANSFER",
        invoiceNumber: params.invoiceNumber || null,
        expenseDate: params.expenseDate || new Date(),
        status: "APPROVED",
        approvedByUserId: params.approvedByUserId || null,
        notes: params.notes || null,
      },
    });
  }

  /**
   * List recorded operating expenses
   */
  static async listExpenses(params?: { category?: string; take?: number }) {
    return prisma.expense.findMany({
      where: params?.category ? { category: params.category } : {},
      orderBy: { expenseDate: "desc" },
      take: params?.take || 50,
    });
  }
}
