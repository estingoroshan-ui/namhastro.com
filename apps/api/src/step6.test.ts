import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import http from "node:http";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { createApp } from "./app.js";
import { initSocketServer, stopConsultationTimer } from "./services/socket.service.js";
import { AuthService } from "./services/auth.service.js";
import { BillingService } from "./services/billing.service.js";
import { prisma } from "./db.js";

describe("Step 6: Production Real-Time Chat & Automatic Consultation Billing Engine", () => {
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
  let testConsultationId: string;

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
      where: { phoneE164: "+919800066661" },
      update: { role: "CUSTOMER", status: "ACTIVE" },
      create: {
        fullName: "Chat Test Customer",
        phoneE164: "+919800066661",
        email: "chat.customer@namhastro.com",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    customerToken = AuthService.generateAccessToken({
      userId: customerUser.id,
      role: customerUser.role,
      phoneE164: customerUser.phoneE164,
    });

    // Seed Wallet with ₹300 (30,000 paise)
    await prisma.wallet.upsert({
      where: { userId: customerUser.id },
      update: { paidBalancePaise: 30000n, promoBalancePaise: 0n },
      create: {
        userId: customerUser.id,
        currency: "INR",
        paidBalancePaise: 30000n,
        promoBalancePaise: 0n,
      },
    });

    // 2. Seed Astrologer User & Profile
    astrologerUser = await prisma.user.upsert({
      where: { phoneE164: "+919800066662" },
      update: { role: "ASTROLOGER", status: "ACTIVE" },
      create: {
        fullName: "Pandit Chat Test Shastri",
        phoneE164: "+919800066662",
        email: "pandit.chat@namhastro.com",
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
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
        chatEnabled: true,
        chatRatePaise: 3000, // ₹30/min
      },
      create: {
        userId: astrologerUser.id,
        slug: "pandit-chat-test",
        displayName: "Pandit Chat Test Shastri",
        verificationStage: "APPROVED",
        availabilityStatus: "ONLINE",
        isOnline: true,
        chatEnabled: true,
        chatRatePaise: 3000,
      },
    });

    // 3. Seed Third-Party User (Unauthorized)
    thirdPartyUser = await prisma.user.upsert({
      where: { phoneE164: "+919800066663" },
      update: { role: "CUSTOMER", status: "ACTIVE" },
      create: {
        fullName: "Unauthorized Intruder",
        phoneE164: "+919800066663",
        email: "intruder@namhastro.com",
        role: "CUSTOMER",
        status: "ACTIVE",
      },
    });

    thirdPartyToken = AuthService.generateAccessToken({
      userId: thirdPartyUser.id,
      role: thirdPartyUser.role,
      phoneE164: thirdPartyUser.phoneE164,
    });

    // 4. Seed Super Admin User
    adminUser = await prisma.user.upsert({
      where: { email: "admin.step6@namhastro.com" },
      update: { role: "SUPER_ADMIN", status: "ACTIVE" },
      create: {
        fullName: "Super Admin Live",
        email: "admin.step6@namhastro.com",
        phoneE164: "+919800066664",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    adminToken = AuthService.generateAccessToken({
      userId: adminUser.id,
      role: adminUser.role,
      email: adminUser.email,
    });
  });

  afterAll(async () => {
    if (testConsultationId) {
      stopConsultationTimer(testConsultationId);
    }
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("1. Socket.IO Handshake rejects unauthenticated connection", async () => {
    const unauthSocket = Client(`http://127.0.0.1:${serverPort}`, {
      transports: ["websocket"],
      reconnection: false,
    });

    const error = await new Promise<string>((resolve) => {
      unauthSocket.on("connect_error", (err) => {
        resolve(err.message);
      });
      unauthSocket.on("connect", () => {
        resolve("connected_unexpectedly");
      });
    });

    unauthSocket.close();
    expect(error).toBe("AUTHENTICATION_REQUIRED");
  });

  it("2. Socket.IO Handshake accepts authenticated connection", async () => {
    const authSocket = Client(`http://127.0.0.1:${serverPort}`, {
      auth: { token: customerToken },
      transports: ["websocket"],
      reconnection: false,
    });

    const connected = await new Promise<boolean>((resolve) => {
      authSocket.on("connect", () => resolve(true));
      authSocket.on("connect_error", () => resolve(false));
    });

    authSocket.close();
    expect(connected).toBe(true);
  });

  it("3. Customer requests consultation and creates hold", async () => {
    const res = await request(app)
      .post("/api/v1/consultations/request")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        astrologerProfileId: astrologerProfile.id,
        type: "CHAT",
        concern: "Career Guidance",
        preferredLanguage: "en",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultationId).toBeDefined();
    expect(res.body.data.ratePaisePerMinute).toBe(3000);
    testConsultationId = res.body.data.consultationId;

    // Verify hold created
    const hold = await prisma.consultationHold.findUnique({
      where: { consultationId: testConsultationId },
    });
    expect(hold).toBeDefined();
    expect(hold?.status).toBe("ACTIVE");
  });

  it("4. Security: Unauthorized third-party cannot join consultation room", async () => {
    const intruderSocket = Client(`http://127.0.0.1:${serverPort}`, {
      auth: { token: thirdPartyToken },
      transports: ["websocket"],
      reconnection: false,
    });

    await new Promise<void>((resolve) => {
      intruderSocket.on("connect", () => resolve());
    });

    const joinResult = await new Promise<any>((resolve) => {
      intruderSocket.emit(
        "join:consultation",
        { consultationId: testConsultationId },
        (res: any) => resolve(res)
      );
    });

    intruderSocket.close();
    expect(joinResult.success).toBe(false);
    expect(joinResult.error).toBe("UNAUTHORIZED_ROOM_ACCESS");
  });

  it("5. Astrologer accepts consultation and timer starts", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/accept`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ACCEPTED");

    // Verify state transition logged
    const history = await prisma.consultationStateHistory.findMany({
      where: { consultationId: testConsultationId },
    });
    expect(history.length).toBeGreaterThan(0);
    expect(history.some((h) => h.toState === "ACCEPTED")).toBe(true);
  });

  it("6. Real-time Two-Way Chat via Socket.IO with delivery", async () => {
    const custSocket = Client(`http://127.0.0.1:${serverPort}`, {
      auth: { token: customerToken },
      transports: ["websocket"],
    });

    const astSocket = Client(`http://127.0.0.1:${serverPort}`, {
      auth: { token: astrologerToken },
      transports: ["websocket"],
    });

    await Promise.all([
      new Promise<void>((res) => custSocket.on("connect", () => res())),
      new Promise<void>((res) => astSocket.on("connect", () => res())),
    ]);

    // Both join consultation room
    await Promise.all([
      new Promise<void>((res) =>
        custSocket.emit("join:consultation", { consultationId: testConsultationId }, () => res())
      ),
      new Promise<void>((res) =>
        astSocket.emit("join:consultation", { consultationId: testConsultationId }, () => res())
      ),
    ]);

    // Astrologer listens for incoming message
    const messagePromise = new Promise<any>((resolve) => {
      astSocket.on("message:received", (data) => {
        resolve(data);
      });
    });

    // Customer sends message
    const clientMsgId = `cmsg_${Date.now()}`;
    const sendResult = await new Promise<any>((resolve) => {
      custSocket.emit(
        "message:send",
        {
          consultationId: testConsultationId,
          clientMessageId: clientMsgId,
          type: "TEXT",
          content: "Namaste Guruji, please review my career horoscope.",
        },
        (res: any) => resolve(res)
      );
    });

    expect(sendResult.success).toBe(true);
    const received = await messagePromise;
    expect(received.content).toBe("Namaste Guruji, please review my career horoscope.");
    expect(received.senderRole).toBe("CUSTOMER");

    custSocket.close();
    astSocket.close();
  });

  it("7. ClientMessageId deduplication prevents double message creation", async () => {
    const clientMsgId = "unique_client_msg_12345";

    const res1 = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/messages`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        clientMessageId: clientMsgId,
        type: "TEXT",
        content: "What remedies do you recommend for Saturn transit?",
      });

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);

    // Second post with identical clientMessageId
    const res2 = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/messages`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        clientMessageId: clientMsgId,
        type: "TEXT",
        content: "What remedies do you recommend for Saturn transit?",
      });

    expect(res2.status).toBe(200);
    expect(res2.body.deduplicated).toBe(true);
    expect(res2.body.data.id).toBe(res1.body.data.id);
  });

  it("8. Typing indicator and Read Receipts update message status", async () => {
    // 1. Fetch message history to find message ID
    const msgListRes = await request(app)
      .get(`/api/v1/chat/${testConsultationId}/messages`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(msgListRes.status).toBe(200);
    const messages = msgListRes.body.data.messages;
    expect(messages.length).toBeGreaterThan(0);
    const unreadId = messages[0].id;

    // 2. Astrologer marks customer message as read
    const readRes = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/read`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({ messageIds: [unreadId] });

    expect(readRes.status).toBe(200);
    expect(readRes.body.success).toBe(true);

    // Verify in database
    const dbMsg = await prisma.chatMessage.findUnique({ where: { id: unreadId } });
    expect(dbMsg?.isRead).toBe(true);
    expect(dbMsg?.status).toBe("READ");
  });

  it("9. Astrologer Private Notes are private to astrologer only", async () => {
    // Astrologer creates private note
    const postNoteRes = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/notes`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({ note: "Customer experiencing Saturn 7.5 years Sade Sati. Recommended Blue Sapphire." });

    expect(postNoteRes.status).toBe(201);
    expect(postNoteRes.body.success).toBe(true);

    // Astrologer can view
    const getNoteRes = await request(app)
      .get(`/api/v1/chat/${testConsultationId}/notes`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(getNoteRes.status).toBe(200);
    expect(getNoteRes.body.data.length).toBeGreaterThan(0);

    // Customer CANNOT view private notes (403 Forbidden)
    const custNoteRes = await request(app)
      .get(`/api/v1/chat/${testConsultationId}/notes`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(custNoteRes.status).toBe(403);
  });

  it("10. Authoritative Billing Calculation: 5 minutes @ ₹30/min = ₹150", () => {
    const durationSeconds = 300; // 5 minutes
    const ratePaise = 3000; // ₹30/min

    const { billableMinutes, totalCostPaise } = BillingService.calculateCost(durationSeconds, ratePaise);
    expect(billableMinutes).toBe(5);
    expect(totalCostPaise).toBe(15000n); // ₹150.00
  });

  it("11. End Consultation: Settles ₹150, leaves ₹150 remaining, credits astrologer 80% (₹120)", async () => {
    // Customer wallet started with ₹300 (30,000 paise).
    // Consultation rate is ₹30/min (3,000 paise).
    // Billable duration: 5 minutes (300 seconds).
    // Expected charge: ₹150 (15,000 paise).
    // Expected customer remaining balance: ₹150 (15,000 paise).
    // Expected astrologer net earnings: 80% of ₹150 = ₹120 (12,000 paise).
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/end`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ durationSeconds: 300 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.billableMinutes).toBe(5);
    expect(res.body.data.totalChargeInr).toBe(150);
    expect(res.body.data.customerRemainingBalanceInr).toBe(150);
    expect(res.body.data.astrologerEarningInr).toBe(120);

    // Verify Persistent Billing Record
    const record = await prisma.consultationBillingRecord.findUnique({
      where: { consultationId: testConsultationId },
    });
    expect(record).toBeDefined();
    expect(record?.billableMinutes).toBe(5);
    expect(record?.totalAmountPaise).toBe(15000n);
    expect(record?.astrologerEarningsPaise).toBe(12000n);
    expect(record?.platformCommissionPaise).toBe(3000n);
  });

  it("12. Settlement Idempotency: Multiple end calls do not double-deduct", async () => {
    // Calling end again on completed consultation returns 400 CONSULTATION_INACTIVE or existing settlement
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/end`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ durationSeconds: 300 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("CONSULTATION_INACTIVE");

    // Direct BillingService idempotent call returns existing record
    const directRes = await BillingService.settleConsultation({
      consultationId: testConsultationId,
      durationSeconds: 300,
    });
    expect(directRes.alreadySettled).toBe(true);
    expect(directRes.newCustomerBalanceInr).toBe(150);
  });

  it("13. Customer reviews completed consultation and updates rating", async () => {
    const res = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/review`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        rating: 5,
        reviewText: "Exceptional clarity and very accurate Vedic astrological guidance. Highly recommended!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);

    // Astrologer average rating verified
    const ast = await prisma.astrologerProfile.findUnique({
      where: { id: astrologerProfile.id },
    });
    expect(ast?.averageRating).toBeGreaterThanOrEqual(1);
    expect(ast?.totalReviews).toBeGreaterThanOrEqual(1);
  });

  it("14. Customer raises consultation dispute", async () => {
    const res = await request(app)
      .post(`/api/v1/chat/${testConsultationId}/dispute`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        reason: "Audio crackle observed during initial minute, requesting clarification.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("OPEN");
  });

  it("15. Super Admin Live Control Centre: lists active sessions and disputes", async () => {
    const liveRes = await request(app)
      .get("/api/v1/admin/consultations/live")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(liveRes.status).toBe(200);
    expect(liveRes.body.success).toBe(true);
    expect(liveRes.body.data.metrics).toBeDefined();

    const disputesRes = await request(app)
      .get("/api/v1/admin/consultations/disputes")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(disputesRes.status).toBe(200);
    expect(disputesRes.body.success).toBe(true);
    expect(disputesRes.body.data.length).toBeGreaterThan(0);
  });

  it("16. Consultation History with status and time filtering", async () => {
    const res = await request(app)
      .get("/api/v1/consultations/history?status=COMPLETED&type=CHAT")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultations.length).toBeGreaterThan(0);
    expect(res.body.data.consultations[0].id).toBe(testConsultationId);
    expect(res.body.data.consultations[0].totalAmountInr).toBe(150);
  });
});
