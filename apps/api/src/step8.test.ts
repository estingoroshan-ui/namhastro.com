import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import http from "node:http";
import { createApp } from "./app.js";
import { AuthService } from "./services/auth.service.js";
import { CommissionService } from "./services/commission.service.js";
import { EarningsService } from "./services/earnings.service.js";
import { SettlementService } from "./services/settlement.service.js";
import { AccountingService } from "./services/accounting.service.js";
import { BillingService } from "./services/billing.service.js";
import { prisma } from "./db.js";

describe("Step 8: Enterprise Commission, Astrologer Earnings, Withdrawal, Settlement & Accounting System", () => {
  let app: any;
  let server: http.Server;
  let serverPort: number;

  let customerUser: any;
  let astrologerUserA: any;
  let astrologerProfileA: any;
  let astrologerUserB: any;
  let astrologerProfileB: any;
  let adminUser: any;

  let customerToken: string;
  let astrologerTokenA: string;
  let astrologerTokenB: string;
  let adminToken: string;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        serverPort = addr.port;
        resolve();
      });
    });

    // Clean up any lingering non-global test rules
    await prisma.commissionRule.deleteMany({
      where: { code: { not: "GLOBAL_DEFAULT" } },
    });

    const timestamp = Date.now();

    // 1. Seed Customer User & Wallet
    customerUser = await prisma.user.create({
      data: {
        phoneE164: `+919888${timestamp.toString().slice(-6)}`,
        fullName: "Test Finance Devotee",
        email: `devotee_step8_${timestamp}@namhastro.com`,
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    await prisma.wallet.create({
      data: {
        userId: customerUser.id,
        paidBalancePaise: 500000n, // ₹5,000
        promoBalancePaise: 50000n,  // ₹500
      },
    });

    customerToken = AuthService.generateAccessToken({
      userId: customerUser.id,
      role: customerUser.role,
    });

    // 2. Seed Astrologer A (Standard rates)
    astrologerUserA = await prisma.user.create({
      data: {
        phoneE164: `+919777${timestamp.toString().slice(-6)}`,
        fullName: "Acharya Someshwar",
        email: `acharya_a_${timestamp}@namhastro.com`,
        role: "ASTROLOGER",
        status: "ACTIVE",
      },
    });

    astrologerProfileA = await prisma.astrologerProfile.create({
      data: {
        userId: astrologerUserA.id,
        slug: `acharya-someshwar-${timestamp}`,
        displayName: "Acharya Someshwar",
        chatRatePaise: 3000,
        audioRatePaise: 3500,
        videoRatePaise: 5000,
        experienceYears: 18,
        qualifications: "M.A. Sanskrit, Jyotish Praveena",
        bio: "Senior Vedic Astrologer specializing in career, finances, and planetary remedies.",
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
      },
    });

    astrologerTokenA = AuthService.generateAccessToken({
      userId: astrologerUserA.id,
      role: astrologerUserA.role,
    });

    // 3. Seed Astrologer B (Custom commission override 15%)
    astrologerUserB = await prisma.user.create({
      data: {
        phoneE164: `+919666${timestamp.toString().slice(-6)}`,
        fullName: "Acharya Gayatri Devi",
        email: `acharya_b_${timestamp}@namhastro.com`,
        role: "ASTROLOGER",
        status: "ACTIVE",
      },
    });

    astrologerProfileB = await prisma.astrologerProfile.create({
      data: {
        userId: astrologerUserB.id,
        slug: `acharya-gayatri-${timestamp}`,
        displayName: "Acharya Gayatri Devi",
        chatRatePaise: 4000,
        audioRatePaise: 4500,
        videoRatePaise: 6000,
        commissionBpsOverride: 1500, // 15% custom override
        experienceYears: 22,
        qualifications: "Gold Medalist Jyotish Shiromani",
        bio: "Celebrated Vastu & Vedic authority with international clientele.",
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
      },
    });

    astrologerTokenB = AuthService.generateAccessToken({
      userId: astrologerUserB.id,
      role: astrologerUserB.role,
    });

    // 4. Seed Super Admin
    adminUser = await prisma.user.create({
      data: {
        phoneE164: `+919111${timestamp.toString().slice(-6)}`,
        fullName: "Finance Super Admin",
        email: `finance_admin_${timestamp}@namhastro.com`,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    adminToken = AuthService.generateAccessToken({
      userId: adminUser.id,
      role: adminUser.role,
    });
  });

  afterAll(async () => {
    await prisma.commissionRule.deleteMany({
      where: { code: { not: "GLOBAL_DEFAULT" } },
    });
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe("1. Dynamic Commission Resolution Engine", () => {
    it("resolves the individual profile override (15%) when configured", async () => {
      const res = await CommissionService.resolveCommission({
        astrologerProfileId: astrologerProfileB.id,
        serviceType: "CHAT",
        amountPaise: 100000n, // ₹1,000
      });

      expect(res.commissionBps).toBe(1500);
      expect(res.commissionPercent).toBe(15.0);
      expect(res.platformSharePaise).toBe(15000n); // ₹150
      expect(res.astrologerSharePaise).toBe(85000n); // ₹850
    });

    it("falls back to global default (20%) when no overrides or specific rules match", async () => {
      const res = await CommissionService.resolveCommission({
        astrologerProfileId: astrologerProfileA.id,
        serviceType: "CHAT",
        amountPaise: 100000n, // ₹1,000
      });

      expect(res.commissionBps).toBe(2000);
      expect(res.commissionPercent).toBe(20.0);
      expect(res.platformSharePaise).toBe(20000n); // ₹200
      expect(res.astrologerSharePaise).toBe(80000n); // ₹800
    });

    it("creates a service-specific rule (e.g. VIDEO at 25%) and applies it for non-overridden astrologers", async () => {
      const rule = await CommissionService.createRule({
        name: "Video Consultation Standard Rate",
        code: `VIDEO_STANDARD_25_${Date.now()}`,
        serviceType: "VIDEO",
        commissionBps: 2500,
        priority: 50,
        creatorUserId: adminUser.id,
      });

      expect(rule).toBeDefined();
      expect(rule.commissionBps).toBe(2500);

      // Astrologer A (no profile override) should get 25% for VIDEO
      const resA = await CommissionService.resolveCommission({
        astrologerProfileId: astrologerProfileA.id,
        serviceType: "VIDEO",
        amountPaise: 100000n,
      });
      expect(resA.commissionBps).toBe(2500);
      expect(resA.platformSharePaise).toBe(25000n);

      // Astrologer B has profile override (1500 bps), which takes highest precedence over service-type rules
      const resB = await CommissionService.resolveCommission({
        astrologerProfileId: astrologerProfileB.id,
        serviceType: "VIDEO",
        amountPaise: 100000n,
      });
      expect(resB.commissionBps).toBe(1500);
      expect(resB.platformSharePaise).toBe(15000n);

      // Clean up rule so other test suites aren't affected
      await prisma.commissionRule.delete({ where: { id: rule.id } });
    });

    it("records an audit log when commission rate is updated", async () => {
      const rule = await CommissionService.createRule({
        name: "Promo Audio Rule",
        code: `PROMO_AUDIO_${Date.now()}`,
        serviceType: "AUDIO",
        commissionBps: 1800,
        creatorUserId: adminUser.id,
      });

      const updated = await CommissionService.updateRule(rule.id, {
        commissionBps: 1200,
        changedByUserId: adminUser.id,
        changeReason: "Festive promotion rate cut",
      });

      expect(updated.commissionBps).toBe(1200);

      const logs = await prisma.commissionAuditLog.findMany({
        where: { ruleId: rule.id },
      });
      expect(logs.length).toBeGreaterThanOrEqual(2);
      expect(logs.some((l) => l.previousBps === 1800 && l.newBps === 1200)).toBe(true);

      // Clean up rule
      await prisma.commissionRule.delete({ where: { id: rule.id } });
    });
  });

  describe("2. Dedicated Astrologer Earnings Account & Hold Engine", () => {
    it("creates dedicated AstrologerEarningsAccount and credits net earnings after platform commission and 1% TDS", async () => {
      const creditRes = await EarningsService.creditConsultationEarnings({
        astrologerProfileId: astrologerProfileA.id,
        consultationId: `cons_test_${Date.now()}`,
        totalGrossPaise: 200000n, // ₹2,000 gross
        commissionBps: 2000,      // 20% commission = ₹400
        tdsRateBps: 100,          // 1% TDS on ₹1,600 = ₹16
        holdHours: 0,             // Immediate availability
      });

      expect(creditRes.platformCommissionPaise).toBe(40000n); // ₹400
      expect(creditRes.astrologerGrossPaise).toBe(160000n);   // ₹1,600
      expect(creditRes.tdsAmountPaise).toBe(1600n);           // ₹16 TDS
      expect(creditRes.netCreditedPaise).toBe(158400n);       // ₹1,584 Net Credited

      const account = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      expect(account.grossEarningsPaise).toBe(160000n);
      expect(account.tdsDeductedPaise).toBe(1600n);
      expect(account.availableBalancePaise).toBe(158400n);
    });

    it("places earnings in pendingEarningsPaise when holdHours > 0", async () => {
      const creditRes = await EarningsService.creditConsultationEarnings({
        astrologerProfileId: astrologerProfileA.id,
        consultationId: `cons_pending_${Date.now()}`,
        totalGrossPaise: 100000n, // ₹1,000 gross
        commissionBps: 2000,      // 20%
        tdsRateBps: 100,          // 1%
        holdHours: 24,            // 24-hour settlement hold
      });

      expect(creditRes.isPending).toBe(true);

      const account = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      expect(account.pendingEarningsPaise).toBe(creditRes.netCreditedPaise);
    });
  });

  describe("3. Astrologer Bank Account Management", () => {
    it("links, verifies and masks astrologer bank account via API", async () => {
      const res = await request(app)
        .post("/api/v1/partner/bank-account")
        .set("Authorization", `Bearer ${astrologerTokenA}`)
        .send({
          accountHolderName: "Acharya Someshwar",
          bankName: "HDFC Bank",
          accountNumber: "50100234567890",
          ifscCode: "HDFC0001234",
          accountType: "SAVINGS",
          panNumber: "ABCDE1234F",
          upiId: "someshwar@hdfcbank",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accountNumberMasked).toContain("7890");
      expect(res.body.data.isVerified).toBe(true);
    });

    it("retrieves linked bank details for the authenticated astrologer", async () => {
      const res = await request(app)
        .get("/api/v1/partner/bank-account")
        .set("Authorization", `Bearer ${astrologerTokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.bankName).toBe("HDFC Bank");
      expect(res.body.data.ifscCode).toBe("HDFC0001234");
    });
  });

  describe("4. Atomic Withdrawal Requests & Balance Reservation", () => {
    it("rejects withdrawal requests below the minimum threshold of ₹500", async () => {
      const res = await request(app)
        .post("/api/v1/partner/withdraw")
        .set("Authorization", `Bearer ${astrologerTokenA}`)
        .send({ amountPaise: 20000 }); // ₹200 < ₹500

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects withdrawal requests exceeding available balance", async () => {
      const res = await request(app)
        .post("/api/v1/partner/withdraw")
        .set("Authorization", `Bearer ${astrologerTokenA}`)
        .send({ amountPaise: 5000000 }); // ₹50,000 > available balance

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("INSUFFICIENT_AVAILABLE_BALANCE");
    });

    it("atomically reserves funds from availableBalancePaise into reservedWithdrawalPaise upon valid withdrawal", async () => {
      const accountBefore = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      const withdrawAmount = 50000n; // ₹500

      const res = await request(app)
        .post("/api/v1/partner/withdraw")
        .set("Authorization", `Bearer ${astrologerTokenA}`)
        .send({ amountPaise: Number(withdrawAmount) });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("REQUESTED");

      const accountAfter = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      expect(accountAfter.availableBalancePaise).toBe(accountBefore.availableBalancePaise - withdrawAmount);
      expect(accountAfter.reservedWithdrawalPaise).toBe(accountBefore.reservedWithdrawalPaise + withdrawAmount);

      // Verify double-entry ledger entry was created
      const ledgerEntry = await prisma.earningsLedgerEntry.findFirst({
        where: {
          astrologerProfileId: astrologerProfileA.id,
          withdrawalRequestId: res.body.data.id,
          type: "WITHDRAWAL_RESERVE",
        },
      });
      expect(ledgerEntry).toBeDefined();
      expect(ledgerEntry?.amountPaise).toBe(-withdrawAmount);
    });
  });

  describe("5. Maker-Checker Payout Approval & Settlement", () => {
    let pendingWithdrawalId: string;

    beforeAll(async () => {
      const w = await prisma.withdrawalRequest.findFirst({
        where: { astrologerProfileId: astrologerProfileA.id, status: "REQUESTED" },
      });
      pendingWithdrawalId = w!.id;
    });

    it("allows Super Admin to approve a REQUESTED withdrawal for payout", async () => {
      const res = await request(app)
        .post(`/api/v1/finance/withdrawals/${pendingWithdrawalId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("APPROVED");
      expect(res.body.data.approvedByUserId).toBe(adminUser.id);
    });

    it("settles approved withdrawal with authoritative bank UTR reference and moves funds to completedWithdrawalsPaise", async () => {
      const accountBefore = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      const utr = `UTR_SETTLE_TEST_${Date.now()}`;

      const res = await request(app)
        .post(`/api/v1/finance/withdrawals/${pendingWithdrawalId}/payout`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ utrNumber: utr });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("PAID");
      expect(res.body.data.utrNumber).toBe(utr);

      const accountAfter = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      expect(accountAfter.reservedWithdrawalPaise).toBe(accountBefore.reservedWithdrawalPaise - 50000n);
      expect(accountAfter.completedWithdrawalsPaise).toBe(accountBefore.completedWithdrawalsPaise + 50000n);

      // Verify WITHDRAWAL_SETTLE ledger entry
      const settleEntry = await prisma.earningsLedgerEntry.findFirst({
        where: { withdrawalRequestId: pendingWithdrawalId, type: "WITHDRAWAL_SETTLE" },
      });
      expect(settleEntry).toBeDefined();
    });
  });

  describe("6. Withdrawal Rejection & Balance Reversal", () => {
    it("reverses reserved funds back into available balance when withdrawal is rejected", async () => {
      // Create a second withdrawal request
      const wdr = await EarningsService.requestWithdrawal({
        astrologerProfileId: astrologerProfileA.id,
        amountPaise: 50000n, // ₹500
        userId: astrologerUserA.id,
      });

      const accountMid = await EarningsService.getOrCreateAccount(astrologerProfileA.id);

      // Reject it
      const res = await request(app)
        .post(`/api/v1/finance/withdrawals/${wdr.id}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Bank account name mismatch" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("REJECTED");
      expect(res.body.data.rejectionReason).toBe("Bank account name mismatch");

      const accountAfter = await EarningsService.getOrCreateAccount(astrologerProfileA.id);
      expect(accountAfter.reservedWithdrawalPaise).toBe(accountMid.reservedWithdrawalPaise - 50000n);
      expect(accountAfter.availableBalancePaise).toBe(accountMid.availableBalancePaise + 50000n);

      // Verify WITHDRAWAL_RELEASE ledger entry
      const releaseEntry = await prisma.earningsLedgerEntry.findFirst({
        where: { withdrawalRequestId: wdr.id, type: "WITHDRAWAL_RELEASE" },
      });
      expect(releaseEntry).toBeDefined();
    });
  });

  describe("7. Automated Settlement Batches", () => {
    let batchId: string;

    beforeAll(async () => {
      // Create and approve a withdrawal request for batching
      const wdr = await EarningsService.requestWithdrawal({
        astrologerProfileId: astrologerProfileA.id,
        amountPaise: 50000n,
        userId: astrologerUserA.id,
      });
      await EarningsService.approveWithdrawal(wdr.id, adminUser.id);
    });

    it("generates an automated settlement batch from all pending approved withdrawal requests", async () => {
      const res = await request(app)
        .post("/api/v1/finance/settlement-batches/generate")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ scheduleType: "DAILY_CYCLE", notes: "Daily evening settlement" });

      expect(res.status).toBe(201);
      expect(res.body.data.batchNumber).toContain("SETTLE-BATCH");
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);

      batchId = res.body.data.id;
    });

    it("exports settlement batch as banking portal CSV format", async () => {
      const res = await request(app)
        .get(`/api/v1/finance/settlement-batches/${batchId}/export`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.header["content-type"]).toContain("text/csv");
      expect(res.text).toContain("Settlement Item ID");
      expect(res.text).toContain("Net Payable (INR)");
    });

    it("executes settlement batch payout, updating all items and completing batch", async () => {
      const res = await request(app)
        .post(`/api/v1/finance/settlement-batches/${batchId}/execute`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("COMPLETED");
      expect(res.body.data.payoutReference).toBeDefined();
      expect(res.body.data.items[0].status).toBe("SUCCESS");
      expect(res.body.data.items[0].utrReference).toBeDefined();
    });
  });

  describe("8. Operating Expenses & Financial P&L", () => {
    it("records operating expenses across Agora, Firebase, and Infrastructure", async () => {
      const resAgora = await request(app)
        .post("/api/v1/finance/expenses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          category: "AGORA_RTC",
          vendor: "Agora Inc.",
          amountPaise: 250000, // ₹2,500
          taxAmountPaise: 45000, // ₹450 GST
          paymentMethod: "CREDIT_CARD",
          invoiceNumber: `INV_AGORA_${Date.now()}`,
          notes: "RTC Voice & Video streaming infrastructure",
        });

      expect(resAgora.status).toBe(201);
      expect(resAgora.body.data.category).toBe("AGORA_RTC");

      const resFirebase = await request(app)
        .post("/api/v1/finance/expenses")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          category: "FIREBASE",
          vendor: "Google Cloud Firebase",
          amountPaise: 120000, // ₹1,200
          invoiceNumber: `INV_GCP_${Date.now()}`,
          notes: "FCM Push Notifications & Cloud Auth",
        });

      expect(resFirebase.status).toBe(201);
    });

    it("computes executive financial overview including collections, liabilities, expenses, and net profit", async () => {
      const res = await request(app)
        .get("/api/v1/finance/overview")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview).toBeDefined();
      expect(res.body.data.overview.totalOperatingExpensesInr).toBeGreaterThan(0);
      expect(res.body.data.overview.customerWalletLiabilityInr).toBeGreaterThan(0);
    });
  });

  describe("9. Automated Financial Reconciliation Engine", () => {
    it("runs automated reconciliation check and verifies zero discrepancy invariance", async () => {
      const res = await request(app)
        .post("/api/v1/finance/reconciliation/run")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("BALANCED");
      expect(Number(res.body.data.discrepancyInr)).toBe(0);
    });

    it("lists historical reconciliation audit records", async () => {
      const res = await request(app)
        .get("/api/v1/finance/reconciliation/history")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].status).toBe("BALANCED");
    });
  });

  describe("10. Full End-to-End Consultation Settlement Integration", () => {
    it("settles a consultation end-to-end with dynamic commission resolution, astrologer earnings account, and ledger entries", async () => {
      // 1. Create a consultation request
      const consultation = await prisma.consultationRequest.create({
        data: {
          customerId: customerUser.id,
          astrologerProfileId: astrologerProfileB.id, // 15% custom commission override
          type: "CHAT",
          status: "ACCEPTED",
          ratePaisePerMinute: 4000, // ₹40/min
          durationSeconds: 300,      // 5 minutes
        },
      });

      // 2. Perform settlement
      const settlement = await BillingService.settleConsultation({
        consultationId: consultation.id,
        durationSeconds: 300,
        endedByUserId: customerUser.id,
        reason: "Consultation completed successfully",
      });

      // 5 min @ ₹40/min = ₹200 (20,000 paise)
      expect(settlement.billableMinutes).toBe(5);
      expect(settlement.totalCostPaise).toBe(20000n);
      // Astrologer B has 15% platform commission override:
      // Platform: 15% of 20000 = 3000 paise (₹30)
      // Astrologer Gross: 17000 paise (₹170)
      expect(settlement.platformCommissionPaise).toBe(3000n);
      expect(settlement.astrologerEarningsPaise).toBe(17000n);

      // Verify persistent billing record has commissionBpsApplied and tdsAmountPaise
      const billingRecord = await prisma.consultationBillingRecord.findUnique({
        where: { consultationId: consultation.id },
      });
      expect(billingRecord).toBeDefined();
      expect(billingRecord?.commissionBpsApplied).toBe(1500);
      expect(billingRecord?.tdsAmountPaise).toBe(170n); // 1% of 17,000 = 170 paise

      // Verify Astrologer B's dedicated earnings account was credited
      const earningsAccount = await EarningsService.getOrCreateAccount(astrologerProfileB.id);
      expect(earningsAccount.grossEarningsPaise).toBeGreaterThanOrEqual(17000n);

      // Verify dedicated earnings ledger entry
      const ledgerEntry = await prisma.earningsLedgerEntry.findFirst({
        where: {
          astrologerProfileId: astrologerProfileB.id,
          consultationId: consultation.id,
          type: "EARNING_CREDIT",
        },
      });
      expect(ledgerEntry).toBeDefined();
      expect(ledgerEntry?.status).toBe("AVAILABLE");
    });
  });
});
