import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { prisma } from "./db.js";

describe("Step 4: Agora Verification & Complete Astrologer Partner System", () => {
  const app = createApp();
  const testRunId = Math.floor(100000 + Math.random() * 900000);

  let adminToken: string;
  let customerToken: string;
  let customerId: string;
  let astrologerToken: string;
  let astrologerUserId: string;
  let astrologerProfileId: string;
  let applicationId: string;
  let documentId: string;
  let consultationId: string;
  let rateChangeRequestId: string;
  let withdrawalRequestId: string;

  it("1. Health check reports Step 4 with Agora verified and DB connected", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.step).toBeGreaterThanOrEqual(4);
    expect(res.body.dependencies.mysql).toBe("connected");
    expect(res.body.dependencies.webrtc).toBe("agora_configured_and_tested");
  });

  it("2. POST /api/v1/consultations/test-rtc mints real Agora AccessToken2", async () => {
    const res = await request(app)
      .post("/api/v1/consultations/test-rtc")
      .send({
        channelName: `test_channel_${testRunId}`,
        uid: 998877,
        role: "publisher",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appId).toBe("5d066243097b4c148739c771cc1cdcd0");
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.token.startsWith("007eJ")).toBe(true);
    expect(res.body.data.uid).toBe(998877);
  });

  it("3. Super Admin logs in and acquires authorization token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "admin@namhastro.com",
        password: "NamhAstro@Admin2026!",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("SUPER_ADMIN");
    adminToken = res.body.data.tokens.accessToken;
  });

  it("4. Customer registers with wallet and birth profile", async () => {
    const phone = `+9198${testRunId.toString().slice(0, 8)}`;
    const sendRes = await request(app).post("/api/v1/auth/otp/send").send({ phone });

    const otp = sendRes.body.debugOtp || "123456";

    const res = await request(app)
      .post("/api/v1/auth/otp/verify")
      .send({
        phone,
        otp,
        fullName: "Rahul Verma",
      });

    expect(res.status).toBe(200);
    customerToken = res.body.data.tokens.accessToken;
    customerId = res.body.data.user.id;

    // Add extra wallet balance for consultations (₹500 / 50000 paise)
    await prisma.wallet.update({
      where: { userId: customerId },
      data: { paidBalancePaise: 50000n },
    });
  });

  it("5. Astrologer registers and applies via POST /api/v1/partner/apply", async () => {
    const astroEmail = `acharya.${testRunId}@namhastro.com`;
    const regRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Acharya Somnath Shastri",
        email: astroEmail,
        password: "VedicPassword123!",
      });

    expect(regRes.status).toBe(201);
    astrologerToken = regRes.body.data.tokens.accessToken;
    astrologerUserId = regRes.body.data.user.id;

    const applyRes = await request(app)
      .post("/api/v1/partner/apply")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        fullName: "Acharya Somnath Shastri",
        displayName: "Acharya Somnath",
        email: astroEmail,
        phoneE164: `+9197${testRunId.toString().slice(0, 8)}`,
        dateOfBirth: "1980-05-15",
        city: "Varanasi",
        state: "Uttar Pradesh",
        country: "India",
        preferredLanguage: "hi",
        experienceYears: 18,
        qualifications: "Shastri from Sampurnanand Sanskrit Vishwavidyalaya",
        specialisations: ["Vedic", "Kundli", "Vastu"],
        languages: ["Hindi", "Sanskrit"],
        bio: "Over 18 years of experience guiding devotees through planetary doshas, muhurat, and Kundli Milan.",
        proposedChatRatePaise: 2500, // ₹25/min
        proposedAudioRatePaise: 3000, // ₹30/min
        proposedVideoRatePaise: 4500, // ₹45/min
      });

    expect(applyRes.status).toBe(201);
    expect(applyRes.body.data.applicationNumber).toBeDefined();
    expect(applyRes.body.data.stage).toBe("APPLIED");
    astrologerProfileId = applyRes.body.data.profileId;
  });

  it("6. Astrologer uploads KYC documents via POST /api/v1/partner/documents", async () => {
    const res = await request(app)
      .post("/api/v1/partner/documents")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        type: "GOVT_ID",
        title: "Aadhaar Card Front and Back",
        fileUrl: "https://storage.namhastro.com/kyc/aadhaar_verified.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("PENDING");
    documentId = res.body.data.id;
  });

  it("7. Astrologer saves bank account via POST /api/v1/partner/bank-details", async () => {
    const res = await request(app)
      .post("/api/v1/partner/bank-details")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        accountHolderName: "Somnath Shastri",
        bankName: "State Bank of India",
        accountNumber: "203948576123",
        ifscCode: "SBIN0001234",
        upiId: "somnath@sbi",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.accountNumberMasked).toContain("6123");
    expect(res.body.data.accountNumberMasked).toContain("XXXX");
  });

  it("8. Super Admin views pending applications via GET /api/v1/admin/applications", async () => {
    const res = await request(app)
      .get("/api/v1/admin/applications")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const appRecord = res.body.data.find((a: any) => a.userId === astrologerUserId);
    expect(appRecord).toBeDefined();
    applicationId = appRecord.id;
  });

  it("9. Super Admin verifies document via POST /api/v1/admin/applications/:id/verify-document", async () => {
    const res = await request(app)
      .post(`/api/v1/admin/applications/${applicationId}/verify-document`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        documentId,
        status: "VERIFIED",
        notes: "Aadhaar Card verified with UIDAI format",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("VERIFIED");
  });

  it("10. Super Admin schedules interview via POST /api/v1/admin/applications/:id/schedule-interview", async () => {
    const res = await request(app)
      .post(`/api/v1/admin/applications/${applicationId}/schedule-interview`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        mode: "VIDEO",
        meetingLink: "https://meet.google.com/namh-astro-interview",
        notes: "Senior Sanskrit Board Astrologer will evaluate chart reading skills",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("SCHEDULED");
  });

  it("11. Super Admin approves astrologer and configures rates", async () => {
    const res = await request(app)
      .post(`/api/v1/admin/applications/${applicationId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        chatRatePaise: 2500,
        audioRatePaise: 3000,
        videoRatePaise: 4500,
        commissionBpsOverride: 2000,
        chatEnabled: true,
        audioEnabled: true,
        videoEnabled: true,
        adminNotes: "Candidate passed interview with exemplary score in Kundli Milan.",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.verificationStage).toBe("ACTIVE");
    expect(res.body.data.availabilityStatus).toBe("ONLINE");
    expect(res.body.data.chatRatePaise).toBe(2500);
  });

  it("12. Astrologer dashboard overview reflects active status and statistics", async () => {
    const res = await request(app)
      .get("/api/v1/partner/dashboard")
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.profile.verificationStage).toBe("ACTIVE");
    expect(res.body.data.profile.isOnline).toBe(true);
    expect(res.body.data.bankAccountConfigured).toBe(true);
  });

  it("13. Astrologer toggles real-time availability via PATCH /api/v1/partner/availability", async () => {
    const res = await request(app)
      .patch("/api/v1/partner/availability")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        isOnline: true,
        availabilityStatus: "ONLINE",
        chatEnabled: true,
        audioEnabled: true,
        videoEnabled: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.isOnline).toBe(true);
    expect(res.body.data.availabilityStatus).toBe("ONLINE");
  });

  it("14. Customer sends consultation request to newly approved astrologer", async () => {
    const res = await request(app)
      .post("/api/v1/consultations/request")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        astrologerProfileId,
        type: "VIDEO",
        concern: "Career progression and business partnership",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.consultationId).toBeDefined();
    expect(res.body.data.type).toBe("VIDEO");
    expect(res.body.data.ratePaisePerMinute).toBe(4500);
    consultationId = res.body.data.consultationId;
  });

  it("15. Astrologer accepts incoming consultation request", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${consultationId}/accept`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ACCEPTED");
    expect(res.body.data.rtcToken.token).toBeDefined();
    expect(res.body.data.rtcToken.token.startsWith("007eJ")).toBe(true);
  });

  it("16. Customer retrieves Agora RTC Token for active consultation room", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${consultationId}/rtc-token`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.channelName).toContain("na_consult_");
    expect(res.body.data.userRole).toBe("CUSTOMER");
  });

  it("17. Astrologer ends consultation session", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${consultationId}/end`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.consultationId).toBe(consultationId);
  });

  it("18. Astrologer submits rate change request", async () => {
    const res = await request(app)
      .post("/api/v1/partner/rate-change-request")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        proposedChatRatePaise: 3500,
        proposedAudioRatePaise: 4000,
        proposedVideoRatePaise: 5500,
        reason: "Completed 500+ consultations with 5-star ratings",
      });

    expect(res.status).toBe(201);
    rateChangeRequestId = res.body.data.id;
  });

  it("19. Super Admin approves rate change request", async () => {
    const res = await request(app)
      .post(`/api/v1/admin/rate-change-requests/${rateChangeRequestId}/review`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        action: "APPROVE",
        notes: "Approved based on client feedback and demand",
      });

    expect(res.status).toBe(200);

    // Verify rate in database
    const profile = await prisma.astrologerProfile.findUnique({ where: { id: astrologerProfileId } });
    expect(profile?.chatRatePaise).toBe(3500);
    expect(profile?.videoRatePaise).toBe(5500);
  });

  it("20. Astrologer submits withdrawal request via POST /api/v1/partner/withdraw", async () => {
    const res = await request(app)
      .post("/api/v1/partner/withdraw")
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        amountPaise: 100000, // ₹1,000
      });

    expect(res.status).toBe(201);
    expect(res.body.data.requestNumber).toBeDefined();
    withdrawalRequestId = res.body.data.requestNumber;
  });

  it("21. Super Admin manages astrologer status: suspends and reactivates", async () => {
    // Suspend
    const suspendRes = await request(app)
      .patch(`/api/v1/admin/astrologers/${astrologerProfileId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        stage: "SUSPENDED",
        reason: "Routine profile audit",
      });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.verificationStage).toBe("SUSPENDED");
    expect(suspendRes.body.data.isOnline).toBe(false);

    // Reactivate
    const reactivateRes = await request(app)
      .patch(`/api/v1/admin/astrologers/${astrologerProfileId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        stage: "ACTIVE",
        reason: "Audit completed and verified",
      });

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.verificationStage).toBe("ACTIVE");
  });
});
