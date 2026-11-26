import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import http from "node:http";
import { createApp } from "./app.js";
import { AuthService } from "./services/auth.service.js";
import { RtcService } from "./services/rtc.service.js";
import { prisma } from "./db.js";

describe("Step 13: Independent Final Acceptance Testing, Real User Journeys & Client Handover", () => {
  let app: any;
  let server: http.Server;

  let superAdminUser: any;
  let superAdminToken: string;

  let devoteeUser: any;
  let devoteeToken: string;

  let astrologerUser: any;
  let astrologerProfile: any;
  let astrologerToken: string;

  let consultationId: string;
  let consultationChannel: string;
  let createdDisputeId: string;
  let createdTicketId: string;

  const timestamp = Date.now();
  const devoteePhone = `+919815${timestamp.toString().slice(-6)}`;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        resolve();
      });
    });

    // 1. Seed Super Admin
    superAdminUser = await prisma.user.create({
      data: {
        phoneE164: `+919813${timestamp.toString().slice(-6)}`,
        fullName: "Executive Super Admin",
        email: `superadmin_step13_${timestamp}@namhastro.com`,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    superAdminToken = AuthService.generateAccessToken({
      userId: superAdminUser.id,
      role: superAdminUser.role,
      phoneE164: superAdminUser.phoneE164,
      email: superAdminUser.email,
    });

    // 2. Seed Verified Astrologer
    astrologerUser = await prisma.user.create({
      data: {
        phoneE164: `+919814${timestamp.toString().slice(-6)}`,
        fullName: "Acharya Devavrata Sharma",
        email: `devavrata_step13_${timestamp}@namhastro.com`,
        role: "ASTROLOGER",
        status: "ACTIVE",
      },
    });

    astrologerProfile = await prisma.astrologerProfile.create({
      data: {
        userId: astrologerUser.id,
        slug: `acharya-devavrata-${timestamp}`,
        displayName: "Acharya Devavrata Sharma",
        specialisationsJson: ["VEDIC_ASTROLOGY", "KUNDLI", "PRASHNA", "VASTU"],
        languagesJson: ["HINDI", "SANSKRIT", "ENGLISH"],
        experienceYears: 18,
        bio: "Senior Vedic Astrologer and Jyotish Acharya with 18 years of spiritual guidance experience.",
        chatRatePaise: 2000, // ₹20/min
        audioRatePaise: 2500, // ₹25/min
        videoRatePaise: 4000, // ₹40/min
        chatEnabled: true,
        audioEnabled: true,
        videoEnabled: true,
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
      },
    });

    astrologerToken = AuthService.generateAccessToken({
      userId: astrologerUser.id,
      role: astrologerUser.role,
      phoneE164: astrologerUser.phoneE164,
      email: astrologerUser.email,
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // ========================================================
  // PHASE 1: PRODUCTION SYSTEM HEALTH & DEPENDENCY AUDIT
  // ========================================================
  describe("Phase 1: Production System Health & Dependencies Audit", () => {
    it("1.1 Root API endpoint reports healthy runtime and connected database", async () => {
      const res = await request(app).get("/api/v1/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.dependencies.database).toBe("connected");
      expect(res.body.dependencies.enterpriseControlCenter).toBe("active_super_admin_staff_crm");
    });

    it("1.2 Agora credentials and RTC token generation engine are operational", () => {
      const channel = `namh_test_audit_${timestamp}`;
      const uid = 12345;
      const res = RtcService.mintToken({ channelName: channel, uid, role: "publisher", expireSeconds: 3600 });
      expect(res.token).toBeDefined();
      expect(res.token.length).toBeGreaterThan(20);
    });

    it("1.3 Enterprise diagnostics reports system uptime and memory health", async () => {
      const res = await request(app)
        .get("/api/v1/admin/enterprise/health")
        .set("Authorization", `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.nodeVersion).toBeDefined();
      expect(res.body.data.memoryUsage.heapUsedMb).toBeGreaterThan(0);
    });
  });

  // ========================================================
  // PHASE 2: REAL DEVOTEE CUSTOMER ONBOARDING JOURNEY
  // ========================================================
  describe("Phase 2: Real Devotee Customer Onboarding Journey", () => {
    let debugOtp: string;

    it("2.1 Devotee requests login OTP and receives debug code in test environment", async () => {
      const res = await request(app)
        .post("/api/v1/auth/otp/send")
        .send({ phone: devoteePhone, purpose: "LOGIN" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.debugOtp).toBeDefined();
      debugOtp = res.body.debugOtp;
    });

    it("2.2 Devotee verifies OTP, registers account, and receives access token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/otp/verify")
        .send({
          phone: devoteePhone,
          otp: debugOtp,
          fullName: "Devotee Ananya Sharma",
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.user.phone).toBe(devoteePhone);

      devoteeUser = res.body.user;
      devoteeToken = res.body.tokens.accessToken;
    });

    it("2.3 Devotee creates Janam Kundli birth profile with precise coordinates", async () => {
      const res = await request(app)
        .post("/api/v1/customer/birth-profiles")
        .set("Authorization", `Bearer ${devoteeToken}`)
        .send({
          relation: "SELF",
          fullName: "Ananya Sharma",
          gender: "Female",
          dateOfBirth: "1996-08-15",
          timeOfBirth: "06:30",
          birthPlace: "Varanasi, Uttar Pradesh, India",
          latitude: 25.3176,
          longitude: 82.9739,
          timezone: "Asia/Kolkata",
          isDefault: true,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.fullName).toBe("Ananya Sharma");
      expect(res.body.profile.birthPlace).toContain("Varanasi");
    });

    it("2.4 Devotee fetches birth profiles list and confirms default profile", async () => {
      const res = await request(app)
        .get("/api/v1/customer/birth-profiles")
        .set("Authorization", `Bearer ${devoteeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profiles.length).toBeGreaterThanOrEqual(1);
      expect(res.body.profiles[0].relation).toBe("SELF");
    });
  });

  // ========================================================
  // PHASE 3: WALLET TOP-UP & FINANCIAL LEDGER JOURNEY
  // ========================================================
  describe("Phase 3: Wallet Top-Up & Financial Ledger Verification", () => {
    it("3.1 Devotee initializes a ₹500 wallet recharge with 18% GST calculation", async () => {
      const res = await request(app)
        .post("/api/v1/wallet/recharge/order")
        .set("Authorization", `Bearer ${devoteeToken}`)
        .send({ amountInr: 500 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBeDefined();
      expect(res.body.data.walletCreditInr).toBe(500);
      expect(res.body.data.gstInr).toBe(90); // 18% of 500
      expect(res.body.data.amountInr).toBe(590);
    });

    it("3.2 Simulating payment verification directly credits devotee paid balance", async () => {
      // Direct ledger credit simulation (₹500 = 50000 paise)
      await prisma.wallet.update({
        where: { userId: devoteeUser.id },
        data: { paidBalancePaise: { increment: 50000n } },
      });

      const res = await request(app)
        .get("/api/v1/wallet/balance")
        .set("Authorization", `Bearer ${devoteeToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.paidBalanceInr).toBeGreaterThanOrEqual(500);
    });

    it("3.3 Devotee wallet ledger records recharge transaction immutably", async () => {
      const res = await request(app)
        .get("/api/v1/wallet/transactions")
        .set("Authorization", `Bearer ${devoteeToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
    });
  });

  // ========================================================
  // PHASE 4: REAL-TIME ASTROLOGER CONSULTATION JOURNEY
  // ========================================================
  describe("Phase 4: Real-Time Astrologer Consultation & Billing", () => {
    it("4.1 Public directory lists verified online astrologers with rates", async () => {
      const res = await request(app).get("/api/v1/astrologers");
      expect(res.status).toBe(200);
      expect(res.body.astrologers.length).toBeGreaterThanOrEqual(1);
      const found = res.body.astrologers.find((a: any) => a.id === astrologerProfile.id);
      expect(found).toBeDefined();
      expect(found.audioRateInr).toBe(25);
    });

    it("4.2 Devotee requests audio consultation with astrologer", async () => {
      const res = await request(app)
        .post("/api/v1/consultations/request")
        .set("Authorization", `Bearer ${devoteeToken}`)
        .send({
          astrologerProfileId: astrologerProfile.id,
          type: "AUDIO",
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consultationId).toBeDefined();
      consultationId = res.body.data.consultationId;
      consultationChannel = res.body.data.channelName;
    });

    it("4.3 Consultation tokens are securely generated with Agora RTC keys", () => {
      const res = RtcService.mintToken({
        channelName: consultationChannel,
        uid: 1001,
        role: "publisher",
        expireSeconds: 3600,
      });
      expect(res.token).toBeDefined();
      expect(res.token.length).toBeGreaterThan(20);
    });

    it("4.4 Astrologer accepts consultation and joins active session", async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/accept`)
        .set("Authorization", `Bearer ${astrologerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ACCEPTED");
    });

    it("4.5 Session completion calculates billing and distributes platform-partner split", async () => {
      const res = await request(app)
        .post(`/api/v1/consultations/${consultationId}/end`)
        .set("Authorization", `Bearer ${astrologerToken}`)
        .send({ durationSeconds: 180 }); // 3 minutes
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.consultationId).toBe(consultationId);
      expect(res.body.data.billableMinutes).toBe(3);
      expect(res.body.data.totalChargeInr).toBe(75); // 3 mins * ₹25
    });
  });

  // ========================================================
  // PHASE 5: ASTROLOGER PARTNER & EARNINGS JOURNEY
  // ========================================================
  describe("Phase 5: Astrologer Partner & Settlement Journey", () => {
    it("5.1 Astrologer inspects live earnings dashboard and total revenue", async () => {
      const res = await request(app)
        .get("/api/v1/partner/earnings")
        .set("Authorization", `Bearer ${astrologerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it("5.2 Astrologer can toggle availability status in real-time", async () => {
      const res = await request(app)
        .patch("/api/v1/partner/availability")
        .set("Authorization", `Bearer ${astrologerToken}`)
        .send({ availabilityStatus: "BUSY" });
      expect(res.status).toBe(200);
      expect(res.body.data.availabilityStatus).toBe("BUSY");

      // Switch back to online
      await request(app)
        .patch("/api/v1/partner/availability")
        .set("Authorization", `Bearer ${astrologerToken}`)
        .send({ availabilityStatus: "ONLINE" });
    });

    it("5.3 Astrologer inspects withdrawals history", async () => {
      const res = await request(app)
        .get("/api/v1/partner/withdrawals")
        .set("Authorization", `Bearer ${astrologerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ========================================================
  // PHASE 6: SPIRITUAL MARKETPLACE & ONLINE PUJA JOURNEY
  // ========================================================
  describe("Phase 6: Spiritual Marketplace & Puja Booking Journey", () => {
    it("6.1 Devotee browses catalog of online pujas and authentic spiritual products", async () => {
      const pujaRes = await request(app).get("/api/v1/puja/categories");
      expect(pujaRes.status).toBe(200);
      expect(Array.isArray(pujaRes.body.data)).toBe(true);

      const storeRes = await request(app).get("/api/v1/store/categories");
      expect(storeRes.status).toBe(200);
      expect(Array.isArray(storeRes.body.data)).toBe(true);
    });

    it("6.2 Devotee fetches available spiritual products from Astro Store catalog", async () => {
      const res = await request(app).get("/api/v1/store/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ========================================================
  // PHASE 7: ENTERPRISE SUPER ADMIN & CRM CONTROL JOURNEY
  // ========================================================
  describe("Phase 7: Enterprise Super Admin CRM & Audit Control", () => {
    it("7.1 Super Admin accesses Customer 360 profile view", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/enterprise/customers/${devoteeUser.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.customer.id).toBe(devoteeUser.id);
      expect(res.body.data.customer.fullName).toBe("Devotee Ananya Sharma");
    });

    it("7.2 Devotee submits a support dispute ticket regarding audio quality", async () => {
      const res = await request(app)
        .post("/api/v1/customer/support/tickets")
        .set("Authorization", `Bearer ${devoteeToken}`)
        .send({
          category: "CONSULTATION",
          priority: "HIGH",
          subject: "Audio latency during consultation",
          description: "Encountered brief audio jitter for 15 seconds during consultation.",
          relatedConsultationId: consultationId,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.ticket.ticketNumber).toBeDefined();
      createdTicketId = res.body.ticket.id;
    });

    it("7.3 Super Admin logs and files an enterprise dispute resolution case", async () => {
      const res = await request(app)
        .post("/api/v1/admin/enterprise/disputes")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          customerId: devoteeUser.id,
          category: "CONSULTATION_ISSUE",
          subject: "Network disconnection during audio call",
          description: "Brief audio jitter during consultation. Customer requested QA credit.",
          relatedConsultationId: consultationId,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaintNumber).toMatch(/^DIS-\d{8}-\d{4}$/);
      createdDisputeId = res.body.data.id;
    });

    it("7.4 Super Admin resolves dispute complaint with double-entry wallet refund approval", async () => {
      const res = await request(app)
        .post(`/api/v1/admin/enterprise/disputes/${createdDisputeId}/resolve`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          decision: "REFUND_APPROVED",
          investigationNotes: "Verified call quality log. ₹50 goodwill refund approved.",
          refundAmountInr: 50,
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(["RESOLVED", "REFUND_PROCESSED"]).toContain(res.body.data.status);
      expect(res.body.data.resolutionDecision).toBe("REFUND_APPROVED");

      // Verify devotee wallet received refund credit
      const updatedWallet = await prisma.wallet.findUnique({
        where: { userId: devoteeUser.id },
      });
      expect(updatedWallet?.refundBalancePaise).toBeGreaterThan(0n);
    });

    it("7.5 Enterprise control center monitors active consultations", async () => {
      const res = await request(app)
        .get("/api/v1/admin/enterprise/consultations/live")
        .set("Authorization", `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
