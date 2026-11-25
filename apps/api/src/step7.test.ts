import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import http from "node:http";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { createApp } from "./app.js";
import { initSocketServer, stopConsultationTimer } from "./services/socket.service.js";
import { AuthService } from "./services/auth.service.js";
import { BillingService } from "./services/billing.service.js";
import { RtcService, stringToUint32 } from "./services/rtc.service.js";
import { prisma } from "./db.js";

describe("Step 7: Production Agora Audio & Video Consultation Engine", () => {
  let app: any;
  let server: http.Server;
  let serverPort: number;
  let customerUser: any;
  let astrologerUser: any;
  let astrologerProfile: any;
  let thirdPartyUser: any;
  let adminUser: any;
  let customerToken: string;
  let astrologerToken: string;
  let thirdPartyToken: string;
  let adminToken: string;
  let audioConsultationId: string;

  beforeAll(async () => {
    app = createApp();
    server = http.createServer(app);
    initSocketServer(server);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address() as any;
        serverPort = addr.port;
        resolve();
      });
    });

    // 1. Seed Customer User
    customerUser = await prisma.user.upsert({
      where: { phoneE164: "+919800077771" },
      update: { role: "CUSTOMER", status: "ACTIVE" },
      create: {
        fullName: "Call Test Customer",
        phoneE164: "+919800077771",
        email: "call.customer@namhastro.com",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    customerToken = AuthService.generateAccessToken({
      userId: customerUser.id,
      role: customerUser.role,
      phoneE164: customerUser.phoneE164,
    });

    // Seed Customer Wallet with ₹500 (50,000 paise: 20,000 promo + 30,000 paid)
    await prisma.wallet.upsert({
      where: { userId: customerUser.id },
      update: {
        paidBalancePaise: 30000n,
        promoBalancePaise: 20000n,
      },
      create: {
        userId: customerUser.id,
        paidBalancePaise: 30000n,
        promoBalancePaise: 20000n,
      },
    });

    // 2. Seed Astrologer User & Profile
    astrologerUser = await prisma.user.upsert({
      where: { phoneE164: "+919800077772" },
      update: { role: "ASTROLOGER", status: "ACTIVE" },
      create: {
        fullName: "Acharya Devendra Shastri",
        phoneE164: "+919800077772",
        email: "acharya.devendra@namhastro.com",
        role: "ASTROLOGER",
        status: "ACTIVE",
      },
    });

    astrologerToken = AuthService.generateAccessToken({
      userId: astrologerUser.id,
      role: astrologerUser.role,
      phoneE164: astrologerUser.phoneE164,
    });

    astrologerProfile = await prisma.astrologerProfile.upsert({
      where: { userId: astrologerUser.id },
      update: {
        availabilityStatus: "ONLINE",
        isOnline: true,
        audioEnabled: true,
        videoEnabled: true,
        chatRatePaise: 2500,  // ₹25/min
        audioRatePaise: 3000, // ₹30/min
        videoRatePaise: 5000, // ₹50/min
      },
      create: {
        userId: astrologerUser.id,
        slug: "acharya-devendra-shastri-call",
        displayName: "Acharya Devendra Shastri",
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
        chatEnabled: true,
        audioEnabled: true,
        videoEnabled: true,
        experienceYears: 16,
        chatRatePaise: 2500,
        audioRatePaise: 3000,
        videoRatePaise: 5000,
        specialisationsJson: ["Vedic", "Career", "Kundli"],
        languagesJson: ["Hindi", "English", "Sanskrit"],
      },
    });

    // 3. Seed Third Party User
    thirdPartyUser = await prisma.user.upsert({
      where: { phoneE164: "+919800077773" },
      update: { role: "CUSTOMER" },
      create: {
        fullName: "Third Party User",
        phoneE164: "+919800077773",
        role: "CUSTOMER",
      },
    });

    thirdPartyToken = AuthService.generateAccessToken({
      userId: thirdPartyUser.id,
      role: thirdPartyUser.role,
      phoneE164: thirdPartyUser.phoneE164,
    });

    // 4. Seed Super Admin User
    adminUser = await prisma.user.upsert({
      where: { phoneE164: "+919800077774" },
      update: { role: "SUPER_ADMIN" },
      create: {
        fullName: "Super Admin Calling",
        phoneE164: "+919800077774",
        role: "SUPER_ADMIN",
      },
    });

    adminToken = AuthService.generateAccessToken({
      userId: adminUser.id,
      role: adminUser.role,
      phoneE164: adminUser.phoneE164,
    });
  });

  afterAll(async () => {
    if (audioConsultationId) {
      stopConsultationTimer(audioConsultationId);
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // 1. Health check verification
  it("1. Health check reports Agora RTC verified and MariaDB connected", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.dependencies.webrtc).toBe("agora_configured_and_tested");
  });

  // 2. Agora RTC token generation
  it("2. RtcService.mintToken generates cryptographically signed Agora AccessToken2", () => {
    const tokenData = RtcService.mintToken({
      channelName: "na_consult_test_channel",
      uid: customerUser.id,
      role: "publisher",
      expireSeconds: 3600,
    });

    expect(tokenData.appId).toBe("5d066243097b4c148739c771cc1cdcd0");
    expect(tokenData.channelName).toBe("na_consult_test_channel");
    expect(typeof tokenData.token).toBe("string");
    expect(tokenData.token.startsWith("007")).toBe(true); // Standard Agora AccessToken2 prefix
    expect(tokenData.uid).toBeGreaterThan(0);
    expect(tokenData.role).toBe("publisher");
    expect(tokenData.expiresInSeconds).toBe(3600);
  });

  // 3. Token Audit Log
  it("3. RtcService.mintAndAuditToken records token creation in RTCTokenAudit table", async () => {
    // Create consultation request for audit reference
    const consult = await prisma.consultationRequest.create({
      data: {
        customerId: customerUser.id,
        astrologerProfileId: astrologerProfile.id,
        type: "AUDIO",
        status: "ACCEPTED",
        ratePaisePerMinute: 3000,
        concern: "Audit Reference",
        channelName: "na_consult_audit_channel",
      },
    });

    const auditRes = await RtcService.mintAndAuditToken({
      consultationId: consult.id,
      userId: customerUser.id,
      channelName: "na_consult_audit_channel",
      role: "publisher",
      expireSeconds: 1800,
      clientIp: "127.0.0.1",
      userAgent: "Vitest Client",
    });

    expect(auditRes.token).toBeDefined();

    // Verify audit entry in database
    const auditEntry = await prisma.rTCTokenAudit.findFirst({
      where: {
        consultationId: consult.id,
        userId: customerUser.id,
      },
    });

    expect(auditEntry).toBeDefined();
    expect(auditEntry?.channelName).toBe("na_consult_audit_channel");
    expect(auditEntry?.role).toBe("publisher");
    expect(auditEntry?.clientIp).toBe("127.0.0.1");
  });

  // 4. Create Audio Call Consultation Request
  it("4. POST /api/v1/consultations/request initiates AUDIO call with hold and 30s SLA", async () => {
    const res = await request(app)
      .post("/api/v1/consultations/request")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        astrologerProfileId: astrologerProfile.id,
        type: "AUDIO",
        concern: "Vedic Career Kundli Analysis",
        preferredLanguage: "hi",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe("AUDIO");
    expect(res.body.data.ratePaisePerMinute).toBe(3000); // ₹30/min
    expect(res.body.data.timeoutSeconds).toBe(30);

    audioConsultationId = res.body.data.consultationId;
    expect(audioConsultationId).toBeDefined();

    // Verify ConsultationHold was placed
    const hold = await prisma.consultationHold.findFirst({
      where: { consultationId: audioConsultationId },
    });
    expect(hold).toBeDefined();
    expect(hold?.status).toBe("ACTIVE");
    expect(hold?.ratePaisePerMinute).toBe(3000);
  });

  // 5. Balance requirement check
  it("5. POST /api/v1/consultations/request rejects request if customer balance is 0", async () => {
    // Zero out third party user's wallet
    await prisma.wallet.upsert({
      where: { userId: thirdPartyUser.id },
      update: { paidBalancePaise: 0n, promoBalancePaise: 0n },
      create: { userId: thirdPartyUser.id, paidBalancePaise: 0n, promoBalancePaise: 0n },
    });

    const res = await request(app)
      .post("/api/v1/consultations/request")
      .set("Authorization", `Bearer ${thirdPartyToken}`)
      .send({
        astrologerProfileId: astrologerProfile.id,
        type: "VIDEO",
        concern: "Video Consultation",
      });

    expect(res.status).toBe(402);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("INSUFFICIENT_BALANCE");
  });

  // 6. Astrologer accepts call & mints RTC token
  it("6. POST /api/v1/consultations/:id/accept transitions call to ACCEPTED and mints RTC tokens", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/accept`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ACCEPTED");
    expect(res.body.data.rtcToken).toBeDefined();
    expect(res.body.data.channelName).toBeDefined();

    // Verify astrologer status is BUSY
    const updatedAst = await prisma.astrologerProfile.findUnique({
      where: { id: astrologerProfile.id },
    });
    expect(updatedAst?.availabilityStatus).toBe("BUSY");
  });

  // 7. Participant RTC Join Event
  it("7. POST /api/v1/consultations/call/:id/join-event records participant join event and tracks numericUid", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/call/${audioConsultationId}/join-event`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        eventType: "JOINED",
        detailsJson: {
          numericUid: stringToUint32(customerUser.id),
          device: "WebRTC Chrome",
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify event in database
    const connEvent = await prisma.callConnectionEvent.findFirst({
      where: {
        consultationId: audioConsultationId,
        eventType: "JOINED",
      },
    });
    expect(connEvent).toBeDefined();
  });

  // 8. Network Quality Telemetry
  it("8. POST /api/v1/consultations/call/:id/quality records network quality and packet loss", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/call/${audioConsultationId}/quality`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        networkQuality: 1, // Excellent
        uplinkBitrateKbps: 64,
        downlinkBitrateKbps: 128,
        packetLossRate: 0.01,
        rttMs: 45,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const metric = await prisma.callQualityMetric.findFirst({
      where: { consultationId: audioConsultationId },
    });
    expect(metric).toBeDefined();
    expect(metric?.networkQuality).toBe(1);
    expect(metric?.rttMs).toBe(45);
  });

  // 9. Request Audio-to-Video Upgrade
  it("9. POST /api/v1/consultations/call/:id/upgrade/request initiates Audio -> Video upgrade negotiation", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/call/${audioConsultationId}/upgrade/request`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.newRatePaisePerMinute).toBe(5000); // Astrologer's video rate: ₹50/min
    expect(res.body.data.upgradeRequestId).toBeDefined();
  });

  // 10. Respond to Audio-to-Video Upgrade
  it("10. POST /api/v1/consultations/call/:id/upgrade/respond accepts upgrade and creates billing segment", async () => {
    const upgradeReq = await prisma.callUpgradeRequest.findFirst({
      where: { consultationId: audioConsultationId, status: "PENDING" },
    });
    expect(upgradeReq).toBeDefined();

    const res = await request(app)
      .post(`/api/v1/consultations/call/${audioConsultationId}/upgrade/respond`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({
        upgradeRequestId: upgradeReq!.id,
        accepted: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accepted).toBe(true);
    expect(res.body.newRatePaisePerMinute).toBe(5000);

    // Verify consultation type switched to VIDEO
    const updatedConsultation = await prisma.consultationRequest.findUnique({
      where: { id: audioConsultationId },
    });
    expect(updatedConsultation?.type).toBe("VIDEO");
    expect(updatedConsultation?.ratePaisePerMinute).toBe(5000);

    // Verify billing segment was created for the audio portion
    const segment = await prisma.consultationBillingSegment.findFirst({
      where: { consultationId: audioConsultationId },
    });
    expect(segment).toBeDefined();
    expect(segment?.callType).toBe("AUDIO");
    expect(segment?.ratePaisePerMinute).toBe(3000);
  });

  // 11. Retrieve Agora Token for Active Call
  it("11. POST /api/v1/consultations/:id/rtc-token issues short-lived token to active participant", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/rtc-token`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.type).toBe("VIDEO"); // Now upgraded to VIDEO
  });

  // 12. Security: Unauthorized token access
  it("12. Security: Third party cannot obtain Agora RTC token for another user's call", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/rtc-token`)
      .set("Authorization", `Bearer ${thirdPartyToken}`)
      .send();

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  // 13. Real-time In-Call Status
  it("13. GET /api/v1/consultations/call/:id/status returns real-time call telemetry and segments", async () => {
    const res = await request(app)
      .get(`/api/v1/consultations/call/${audioConsultationId}/status`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe("VIDEO");
    expect(res.body.data.billingSegments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.astrologer.name).toBe("Acharya Devendra Shastri");
  });

  // 14. End Call and Multi-Segment Settlement
  it("14. POST /api/v1/consultations/:id/end finalizes multi-segment settlement with 80/20 earnings", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/end`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ durationSeconds: 120, reason: "Customer ended call successfully" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const settlement = res.body.data;
    expect(settlement.consultationId).toBe(audioConsultationId);
    expect(settlement.billableMinutes).toBeGreaterThanOrEqual(2);
    expect(BigInt(settlement.astrologerEarningsPaise)).toBeGreaterThan(0n);
    expect(BigInt(settlement.platformCommissionPaise)).toBeGreaterThan(0n);

    // Verify 80/20 proportion
    const total = BigInt(settlement.totalCostPaise);
    const astEarnings = BigInt(settlement.astrologerEarningsPaise);
    expect(astEarnings).toBe((total * 80n) / 100n);

    // Verify astrologer restored to ONLINE
    const ast = await prisma.astrologerProfile.findUnique({
      where: { id: astrologerProfile.id },
    });
    expect(ast?.availabilityStatus).toBe("ONLINE");

    // Verify ConsultationHold was SETTLED
    const hold = await prisma.consultationHold.findFirst({
      where: { consultationId: audioConsultationId },
    });
    expect(hold?.status).toBe("SETTLED");
  });

  // 15. Security: Completed call rejects new RTC token requests
  it("15. Security: Completed call rejects new RTC token generation", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/rtc-token`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("CONSULTATION_INACTIVE");
  });

  // 16. Idempotent call termination
  it("16. Idempotent Settlement: duplicate /end returns 400 CONSULTATION_INACTIVE and BillingService returns existing record", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${audioConsultationId}/end`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({ durationSeconds: 120 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("CONSULTATION_INACTIVE");

    const directRes = await BillingService.settleConsultation({
      consultationId: audioConsultationId,
      durationSeconds: 120,
    });
    expect(directRes.alreadySettled).toBe(true);
  });

  // 17. Super Admin Live Calling & Call Settings
  it("17. Super Admin can view live calling metrics and update call settings", async () => {
    // 17A. Live Calling Telemetry
    const liveRes = await request(app)
      .get("/api/v1/consultations/admin/live-calling")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(liveRes.status).toBe(200);
    expect(liveRes.body.success).toBe(true);
    expect(liveRes.body.data.kpi.agoraStatus).toBe("HEALTHY");

    // 17B. Call Settings Read & Update
    const getSettingsRes = await request(app)
      .get("/api/v1/consultations/admin/call-settings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getSettingsRes.status).toBe(200);
    expect(getSettingsRes.body.data.enableAudio).toBe(true);
    expect(getSettingsRes.body.data.enableVideo).toBe(true);

    const putSettingsRes = await request(app)
      .put("/api/v1/consultations/admin/call-settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ENABLE_AUDIO_CONSULTATION: "true",
        ENABLE_VIDEO_CONSULTATION: "true",
        INCOMING_CALL_TIMEOUT_SECONDS: "30",
      });

    expect(putSettingsRes.status).toBe(200);
    expect(putSettingsRes.body.success).toBe(true);
  });
});
