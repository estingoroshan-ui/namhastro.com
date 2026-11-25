import { describe, expect, it } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import { createApp } from "./app.js";
import { prisma } from "./db.js";
import { AuthService } from "./services/auth.service.js";
import { FirebaseService } from "./services/firebase.service.js";
import { env } from "./config/env.js";

const app = createApp({
  checkDatabase: async () => "connected",
});

describe("Step 5: Production Payment Gateway, Wallet & Financial Ledger Engine", () => {
  const testRunId = Date.now();
  const testPhone = "+9198" + testRunId.toString().slice(-8);
  let customerToken: string;
  let customerId: string;
  let astrologerToken: string;
  let astrologerUserId: string;
  let astrologerProfileId: string;

  let createdGatewayOrderId: string;
  let createdPaymentOrderId: string;
  let testConsultationId: string;

  it("1. Phase 0 Security: RTC test endpoint is restricted and credentials are secure", async () => {
    // When in simulated production, test-rtc should return 403
    const originalEnv = env.NODE_ENV;
    (env as any).NODE_ENV = "production";

    const res = await request(app)
      .post("/api/v1/consultations/test-rtc")
      .send({ channelName: "prod-restricted" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("ENDPOINT_DISABLED_IN_PRODUCTION");

    (env as any).NODE_ENV = originalEnv;
  });

  it("2. Phase 0 Firebase: Admin SDK status and device token registration", async () => {
    const status = FirebaseService.getStatus();
    expect(status.projectId).toBe("namhastro-e8dab");

    // Authenticate test customer
    const user = await prisma.user.upsert({
      where: { phoneE164: testPhone },
      update: { role: "CUSTOMER", status: "ACTIVE" },
      create: {
        fullName: "Step 5 Financial Test Customer",
        phoneE164: testPhone,
        role: "CUSTOMER",
        status: "ACTIVE",
        wallet: {
          create: {
            currency: "INR",
            paidBalancePaise: 0n,
            promoBalancePaise: 0n,
          },
        },
      },
    });
    customerId = user.id;
    customerToken = AuthService.generateAccessToken(user);

    // Register FCM device token
    const devToken = `fcm_test_token_${Date.now()}`;
    const tokenRes = await request(app)
      .post("/api/v1/partner/device-token")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ token: devToken, platform: "web", deviceName: "Chrome Desktop Test" });

    expect(tokenRes.status).toBe(200);
    expect(tokenRes.body.success).toBe(true);
    expect(tokenRes.body.data.token).toBe(devToken);

    // Send push notification simulation
    const pushRes = await FirebaseService.sendPush({
      userId: customerId,
      title: "Test Alert",
      body: "Security and notification verified",
    });
    expect(pushRes.success).toBe(true);
  });

  it("3. GET /api/v1/wallet/packages lists official recharge packs with bonuses", async () => {
    const res = await request(app).get("/api/v1/wallet/packages");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);

    const pack500 = res.body.data.find((p: any) => p.amountInr === 500);
    expect(pack500).toBeDefined();
    expect(pack500.bonusInr).toBe(50); // ₹50 bonus
    expect(pack500.isPopular).toBe(true);
  });

  it("4. GET /api/v1/wallet/balance requires authentication and returns segregated balances", async () => {
    const unauth = await request(app).get("/api/v1/wallet/balance");
    expect(unauth.status).toBe(401);

    const authRes = await request(app)
      .get("/api/v1/wallet/balance")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.data.currency).toBe("INR");
    expect(typeof authRes.body.data.paidBalanceInr).toBe("number");
    expect(typeof authRes.body.data.promoBalanceInr).toBe("number");
  });

  it("5. POST /api/v1/wallet/recharge/order creates Razorpay order with 18% GST breakdown", async () => {
    const pack500 = await prisma.rechargePackage.findUnique({ where: { code: "RECHARGE_500" } });

    const res = await request(app)
      .post("/api/v1/wallet/recharge/order")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        amountInr: 500,
        rechargePackageId: pack500?.id,
        customerGstin: "07AAAAA0000A1Z5",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.walletCreditInr).toBe(500);
    expect(res.body.data.gstInr).toBe(90); // 18% GST on ₹500
    expect(res.body.data.amountInr).toBe(590); // Total payable: ₹590
    expect(res.body.data.bonusInr).toBe(50); // ₹50 promotional credit

    createdGatewayOrderId = res.body.data.gatewayOrderId;
    createdPaymentOrderId = res.body.data.orderId;
  });

  it("6. POST /api/v1/wallet/recharge/verify validates signature, credits wallet and issues GST invoice", async () => {
    const simPaymentId = `pay_test_${Date.now()}`;
    const secret = env.RAZORPAY_KEY_SECRET || "simulated_payment_key_secret";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${createdGatewayOrderId}|${simPaymentId}`)
      .digest("hex");

    const res = await request(app)
      .post("/api/v1/wallet/recharge/verify")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        gatewayOrderId: createdGatewayOrderId,
        gatewayPaymentId: simPaymentId,
        gatewaySignature: validSignature,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paidBalanceInr).toBeGreaterThanOrEqual(500);
    expect(res.body.data.promoBalanceInr).toBeGreaterThanOrEqual(50);
    expect(res.body.data.invoiceNumber).toMatch(/^NA-INV-/);

    // Verify wallet in DB
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    expect(wallet?.paidBalancePaise).toBe(50000n); // ₹500
    expect(wallet?.promoBalancePaise).toBe(5000n); // ₹50 bonus
  });

  it("7. POST /api/v1/wallet/recharge/verify enforces idempotency without double-credit", async () => {
    const res = await request(app)
      .post("/api/v1/wallet/recharge/verify")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        gatewayOrderId: createdGatewayOrderId,
        gatewayPaymentId: "pay_duplicate_check",
        gatewaySignature: "simulated_valid_test_signature",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Balance should remain unchanged (not doubled)
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    expect(wallet?.paidBalancePaise).toBe(50000n);
  });

  it("8. GET /api/v1/wallet/invoices lists customer GST tax invoices", async () => {
    const res = await request(app)
      .get("/api/v1/wallet/invoices")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const inv = res.body.data[0];
    expect(inv.sacCode).toBe("998399");
    expect(inv.taxableAmountInr).toBe("500.00");
    expect(inv.cgstInr).toBe("45.00"); // 9% CGST
    expect(inv.sgstInr).toBe("45.00"); // 9% SGST
    expect(inv.totalAmountInr).toBe("590.00");
  });

  it("9. POST /api/v1/wallet/recharge/webhook verifies HMAC-SHA256 signature", async () => {
    // Create new order for webhook test
    const newOrder = await prisma.paymentOrder.create({
      data: {
        orderNumber: `ORD-WH-${Date.now()}`,
        userId: customerId,
        gateway: "RAZORPAY",
        gatewayOrderId: `order_wh_${Date.now()}`,
        amountPaise: 23600n, // ₹200 + 18% GST = ₹236
        taxablePaise: 20000n,
        gstPaise: 3600n,
        promoBonusPaise: 0n,
        status: "PENDING",
      },
    });

    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || "simulated_webhook_secret";
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_wh_${Date.now()}`,
            order_id: newOrder.gatewayOrderId,
          },
        },
      },
    });

    const validSignature = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

    const res = await request(app)
      .post("/api/v1/wallet/recharge/webhook")
      .set("x-razorpay-signature", validSignature)
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify order was marked SUCCESS
    const updatedOrder = await prisma.paymentOrder.findUnique({ where: { id: newOrder.id } });
    expect(updatedOrder?.status).toBe("SUCCESS");
  });

  it("10. Consultation Lifecycle: Request creates hold and calculates max duration", async () => {
    // Setup online astrologer
    const astUser = await prisma.user.upsert({
      where: { phoneE164: "+919877788899" },
      update: { role: "ASTROLOGER", status: "ACTIVE" },
      create: {
        fullName: "Acharya Ved Prakash",
        phoneE164: "+919877788899",
        role: "ASTROLOGER",
        status: "ACTIVE",
      },
    });
    astrologerUserId = astUser.id;
    astrologerToken = AuthService.generateAccessToken(astUser);

    const profile = await prisma.astrologerProfile.upsert({
      where: { userId: astUser.id },
      update: { availabilityStatus: "ONLINE", videoEnabled: true, videoRatePaise: 5000 }, // ₹50/min
      create: {
        userId: astUser.id,
        slug: "acharya-ved-prakash-test",
        displayName: "Acharya Ved Prakash",
        verificationStage: "ACTIVE",
        availabilityStatus: "ONLINE",
        videoEnabled: true,
        videoRatePaise: 5000,
        experienceYears: 15,
      },
    });
    astrologerProfileId = profile.id;

    // Customer requests video call
    const res = await request(app)
      .post("/api/v1/consultations/request")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        astrologerProfileId,
        type: "VIDEO",
        concern: "Kundli Analysis & Career Guidance",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeoutSeconds).toBe(30);
    expect(res.body.data.maxDurationSeconds).toBeGreaterThan(0);

    testConsultationId = res.body.data.consultationId;

    // Verify hold was created
    const hold = await prisma.consultationHold.findUnique({ where: { consultationId: testConsultationId } });
    expect(hold).toBeDefined();
    expect(hold?.status).toBe("ACTIVE");
  });

  it("11. Consultation Lifecycle: Astrologer accepts call and Agora token is generated", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/accept`)
      .set("Authorization", `Bearer ${astrologerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rtcToken).toBeDefined();
    expect(res.body.data.channelName).toMatch(/^na_consult_/);
  });

  it("12. Consultation Lifecycle: End call performs atomic double-entry settlement and astrologer 80% split", async () => {
    // Conclude 3-minute call (180 seconds)
    // Rate: ₹50/min (5000 paise/min) -> 3 mins = ₹150 (15,000 paise)
    // Astrologer split: 80% of ₹150 = ₹120 (12,000 paise)
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/end`)
      .set("Authorization", `Bearer ${astrologerToken}`)
      .send({ durationSeconds: 180 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.billableMinutes).toBe(3);
    expect(res.body.data.totalChargeInr).toBe(150); // ₹150 charged
    expect(res.body.data.astrologerEarningInr).toBe(120); // ₹120 credited to astrologer

    // Verify hold is SETTLED
    const hold = await prisma.consultationHold.findUnique({ where: { consultationId: testConsultationId } });
    expect(hold?.status).toBe("SETTLED");
    expect(hold?.settledAmountPaise).toBe(15000n);

    // Verify customer wallet transaction recorded
    const customerTx = await prisma.walletTransaction.findFirst({
      where: { referenceId: testConsultationId, type: "CONSULTATION_DEBIT" },
    });
    expect(customerTx).toBeDefined();
    expect(customerTx?.amountPaise).toBe(15000n);

    // Verify astrologer wallet transaction recorded
    const astrologerTx = await prisma.walletTransaction.findFirst({
      where: { referenceId: testConsultationId, type: "WALLET_RECHARGE" },
    });
    expect(astrologerTx).toBeDefined();
    expect(astrologerTx?.amountPaise).toBe(12000n);

    // Verify astrologer status reset to ONLINE
    const ast = await prisma.astrologerProfile.findUnique({ where: { id: astrologerProfileId } });
    expect(ast?.availabilityStatus).toBe("ONLINE");
  });

  it("13. Security: Inactive completed consultation rejects new Agora RTC token requests", async () => {
    const res = await request(app)
      .post(`/api/v1/consultations/${testConsultationId}/rtc-token`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("CONSULTATION_INACTIVE");
  });

  it("14. GET /api/v1/wallet/transactions returns paginated financial ledger", async () => {
    const res = await request(app)
      .get("/api/v1/wallet/transactions?page=1&limit=10")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
    expect(res.body.data.total).toBeGreaterThanOrEqual(2); // Recharge + Consultation debit
  });
});
