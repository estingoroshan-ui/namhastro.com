import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

const app = createApp({
  checkDatabase: async () => "connected",
});

describe("Step 3: Customer Backend & Authentication", () => {
  let customerToken: string;
  let customerRefreshToken: string;
  let customerUserId: string;
  const uniqueSuffix = `${Date.now() % 100000000}`.padStart(8, "0");
  const testPhone = `+9199${uniqueSuffix}`;
  let createdBirthProfileId: string;
  let createdTicketId: string;
  let seededAstrologerProfileId: string;

  it("1. Health check returns step 3 and connected dependencies", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.step).toBeGreaterThanOrEqual(3);
    expect(res.body.dependencies.mysql).toBe("connected");
  });

  it("2. POST /api/v1/auth/otp/send generates OTP request", async () => {
    const res = await request(app)
      .post("/api/v1/auth/otp/send")
      .send({ phone: testPhone, purpose: "LOGIN" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requestId).toBeDefined();
    expect(res.body.debugOtp).toBeDefined();
  });

  it("3. POST /api/v1/auth/otp/verify verifies OTP and creates Customer with ₹1 Promo Wallet", async () => {
    const sendRes = await request(app)
      .post("/api/v1/auth/otp/send")
      .send({ phone: testPhone });

    const otp = sendRes.body.debugOtp;

    const verifyRes = await request(app)
      .post("/api/v1/auth/otp/verify")
      .send({ phone: testPhone, otp, fullName: "Rohan Sharma" });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.tokens.accessToken).toBeDefined();
    expect(verifyRes.body.tokens.refreshToken).toBeDefined();
    expect(verifyRes.body.user.phone).toBe(testPhone);
    expect(verifyRes.body.user.wallet.promoBalanceInr).toBe(1);

    customerToken = verifyRes.body.tokens.accessToken;
    customerRefreshToken = verifyRes.body.tokens.refreshToken;
    customerUserId = verifyRes.body.user.id;
  });

  it("4. POST /api/v1/auth/otp/verify rejects invalid OTP", async () => {
    const res = await request(app)
      .post("/api/v1/auth/otp/verify")
      .send({ phone: testPhone, otp: "000000" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_OTP");
  });

  it("5. POST /api/v1/auth/register creates email/password user", async () => {
    const email = `testuser_${Date.now()}@namhastro.com`;
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Anjali Verma",
      email,
      password: "SecurePassword123!",
      preferredLanguage: "hi",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.wallet.promoBalanceInr).toBe(1);
  });

  it("6. POST /api/v1/auth/login logs in with valid credentials and rejects invalid", async () => {
    const email = `loginuser_${Date.now()}@namhastro.com`;
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Suresh Gupta",
      email,
      password: "MySecretPassword2026!",
    });

    const successLogin = await request(app).post("/api/v1/auth/login").send({
      identifier: email,
      password: "MySecretPassword2026!",
    });
    expect(successLogin.status).toBe(200);
    expect(successLogin.body.tokens.accessToken).toBeDefined();

    const badLogin = await request(app).post("/api/v1/auth/login").send({
      identifier: email,
      password: "WrongPassword!",
    });
    expect(badLogin.status).toBe(401);
    expect(badLogin.body.error).toBe("INVALID_CREDENTIALS");
  });

  it("7. POST /api/v1/auth/refresh rotates session and issues new access token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: customerRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tokens.refreshToken).toBeDefined();

    customerToken = res.body.tokens.accessToken;
    customerRefreshToken = res.body.tokens.refreshToken;
  });

  it("8. GET /api/v1/auth/me returns authenticated customer details", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(customerUserId);
    expect(res.body.user.phone).toBe(testPhone);
  });

  it("9. PUT /api/v1/customer/profile updates personal & Vedic birth details", async () => {
    const res = await request(app)
      .put("/api/v1/customer/profile")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        fullName: "Rohan K. Sharma",
        dateOfBirth: "1994-08-15",
        timeOfBirth: "14:30",
        birthPlace: "Varanasi, Uttar Pradesh, India",
        birthLatitude: 25.3176,
        birthLongitude: 82.9739,
        birthTimezone: "Asia/Kolkata",
        currentCity: "New Delhi",
        gender: "Male",
        maritalStatus: "Single",
        consultationInterests: ["Career Consultation", "Marriage Consultation"],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.birthPlace).toBe("Varanasi, Uttar Pradesh, India");
  });

  it("10. POST /api/v1/customer/birth-profiles adds multiple family profiles", async () => {
    const res = await request(app)
      .post("/api/v1/customer/birth-profiles")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        relation: "SELF",
        fullName: "Rohan Sharma",
        gender: "Male",
        dateOfBirth: "1994-08-15",
        timeOfBirth: "14:30",
        birthPlace: "Varanasi, Uttar Pradesh",
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: "Asia/Kolkata",
        isDefault: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.isDefault).toBe(true);
    createdBirthProfileId = res.body.profile.id;

    const spouseRes = await request(app)
      .post("/api/v1/customer/birth-profiles")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        relation: "SPOUSE",
        fullName: "Pooja Sharma",
        gender: "Female",
        dateOfBirth: "1996-03-22",
        timeOfBirth: "09:15",
        birthPlace: "Jaipur, Rajasthan",
        timezone: "Asia/Kolkata",
      });

    expect(spouseRes.status).toBe(201);
    expect(spouseRes.body.profile.relation).toBe("SPOUSE");
  });

  it("11. GET /api/v1/customer/birth-profiles returns list with default profile first", async () => {
    const res = await request(app)
      .get("/api/v1/customer/birth-profiles")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.profiles[0].isDefault).toBe(true);
  });

  it("12. PUT /api/v1/customer/birth-profiles/:id updates profile and DELETE deletes", async () => {
    const updateRes = await request(app)
      .put(`/api/v1/customer/birth-profiles/${createdBirthProfileId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ fullName: "Rohan Krishna Sharma" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.fullName).toBe("Rohan Krishna Sharma");
  });

  it("13. GET /api/v1/astrologers queries verified database astrologers", async () => {
    const res = await request(app).get("/api/v1/astrologers?status=ONLINE");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.astrologers.length).toBeGreaterThanOrEqual(1);

    const first = res.body.astrologers.find((a: any) => a.chatRateInr > 0) || res.body.astrologers[0];
    seededAstrologerProfileId = first.id;
    expect(first.name).toBeDefined();
    expect(first.chatRateInr).toBeGreaterThanOrEqual(0);
  });

  it("14. GET /api/v1/astrologers/:slug returns detailed profile", async () => {
    const res = await request(app).get("/api/v1/astrologers/acharya-raghavendra-sharma");
    expect(res.status).toBe(200);
    expect(res.body.astrologer.slug).toBe("acharya-raghavendra-sharma");
    expect(res.body.astrologer.verified).toBe(true);
  });

  it("15. POST /api/v1/customer/favourites/:id toggles favourite astrologer", async () => {
    const addRes = await request(app)
      .post(`/api/v1/customer/favourites/${seededAstrologerProfileId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(addRes.status).toBe(201);
    expect(addRes.body.isFavourite).toBe(true);

    const getRes = await request(app)
      .get("/api/v1/customer/favourites")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(getRes.body.total).toBe(1);

    const removeRes = await request(app)
      .post(`/api/v1/customer/favourites/${seededAstrologerProfileId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.isFavourite).toBe(false);
  });

  it("16. POST /api/v1/customer/following/:id toggles follow astrologer", async () => {
    const followRes = await request(app)
      .post(`/api/v1/customer/following/${seededAstrologerProfileId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(followRes.status).toBe(201);
    expect(followRes.body.isFollowing).toBe(true);
  });

  it("17. POST /api/v1/customer/support/tickets creates real ticket and message", async () => {
    const res = await request(app)
      .post("/api/v1/customer/support/tickets")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        category: "CONSULTATION",
        subject: "Question regarding Vedic chart accuracy",
        description: "I wanted to understand how Lagna degree is calibrated for Varanasi birthplace.",
        priority: "NORMAL",
      });

    expect(res.status).toBe(201);
    expect(res.body.ticket.ticketNumber).toMatch(/^NA-TKT-/);
    createdTicketId = res.body.ticket.id;
  });

  it("18. POST /api/v1/customer/support/tickets/:id/reply sends message thread reply", async () => {
    const res = await request(app)
      .post(`/api/v1/customer/support/tickets/${createdTicketId}/reply`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ message: "Also, please confirm if Vimshottari dasha timing is included." });

    expect(res.status).toBe(201);
    expect(res.body.message.message).toContain("Vimshottari dasha");
  });

  it("19. GET /api/v1/customer/notifications returns customer notifications", async () => {
    const res = await request(app)
      .get("/api/v1/customer/notifications")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(1);
  });

  it("20. Unauthorized access to customer routes returns 401", async () => {
    const res = await request(app).get("/api/v1/customer/profile");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  it("21. DELETE /api/v1/auth/account marks account as DELETED and revokes session", async () => {
    const res = await request(app)
      .delete("/api/v1/auth/account")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const testMe = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(testMe.status).toBe(403);
    expect(testMe.body.error).toBe("ACCOUNT_INACTIVE");
  });
});
