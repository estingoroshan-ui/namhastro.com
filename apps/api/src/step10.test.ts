import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import http from "node:http";
import { createApp } from "./app.js";
import { AuthService } from "./services/auth.service.js";
import { PujaService } from "./services/puja.service.js";
import { StoreService } from "./services/store.service.js";
import { MarketingService } from "./services/marketing.service.js";
import { prisma } from "./db.js";

describe("Step 10: Complete Spiritual Marketplace, Online Puja Booking, Pandit Management, Astro Store, E-commerce, Referral & Marketing Automation", () => {
  let app: any;
  let server: http.Server;
  let serverPort: number;

  let customerUser: any;
  let panditUser: any;
  let adminUser: any;

  let customerToken: string;
  let panditToken: string;
  let adminToken: string;

  let seededCategory: any;
  let testTemple: any;
  let testPujaService: any;
  let testPackage: any;
  let testBookingId: string;
  let panditProfileId: string;

  let seededProductCat: any;
  let testProduct: any;
  let testStoreOrderId: string;

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

    // Ensure standard banners are seeded
    await MarketingService.seedStandardBanners();

    const timestamp = Date.now();

    // 1. Seed Customer User
    customerUser = await prisma.user.create({
      data: {
        phoneE164: `+919876${timestamp.toString().slice(-6)}`,
        fullName: "Aarav Sharma Devotee",
        email: `devotee_step10_${timestamp}@namhastro.com`,
        role: "CUSTOMER",
        status: "ACTIVE"
      }
    });

    await prisma.wallet.create({
      data: {
        userId: customerUser.id,
        paidBalancePaise: 5000000n, // Rs 50,000
        promoBalancePaise: 50000n
      }
    });

    customerToken = AuthService.generateAccessToken({
      userId: customerUser.id,
      role: customerUser.role,
      phoneE164: customerUser.phoneE164,
      email: customerUser.email
    });

    // 2. Seed Pandit User (initially CUSTOMER, will apply to become PANDIT)
    panditUser = await prisma.user.create({
      data: {
        phoneE164: `+919875${timestamp.toString().slice(-6)}`,
        fullName: "Acharya Vidyadhar Shastri",
        email: `acharya_step10_${timestamp}@namhastro.com`,
        role: "CUSTOMER",
        status: "ACTIVE"
      }
    });

    panditToken = AuthService.generateAccessToken({
      userId: panditUser.id,
      role: panditUser.role,
      phoneE164: panditUser.phoneE164,
      email: panditUser.email
    });

    // 3. Seed Super Admin User
    adminUser = await prisma.user.create({
      data: {
        phoneE164: `+919874${timestamp.toString().slice(-6)}`,
        fullName: "Marketplace Super Admin",
        email: `admin_step10_${timestamp}@namhastro.com`,
        role: "SUPER_ADMIN",
        status: "ACTIVE"
      }
    });

    adminToken = AuthService.generateAccessToken({
      userId: adminUser.id,
      role: adminUser.role,
      phoneE164: adminUser.phoneE164,
      email: adminUser.email
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // ==========================================
  // SECTION 1: PUJA CATEGORIES & TEMPLE MANAGEMENT
  // ==========================================
  describe("1. Puja Categories & Temples", () => {
    it("should seed and retrieve all 22 standard puja categories", async () => {
      const res = await request(app).get("/api/v1/puja/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(22);

      const rudrabhishek = res.body.data.find((c: any) => c.slug === "rudrabhishek");
      expect(rudrabhishek).toBeDefined();
      expect(rudrabhishek.name).toBe("Rudrabhishek");
      seededCategory = rudrabhishek;
    });

    it("should create and retrieve a sacred temple location", async () => {
      const templeRes = await request(app)
        .post("/api/v1/admin/marketplace/temples")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Kashi Vishwanath Temple",
          deity: "Lord Shiva",
          city: "Varanasi",
          state: "Uttar Pradesh",
          description: "One of the twelve most sacred Jyotirlingas on the banks of holy Ganga.",
          capacityPerDay: 50
        });

      expect(templeRes.status).toBe(201);
      expect(templeRes.body.success).toBe(true);
      expect(templeRes.body.data.name).toBe("Kashi Vishwanath Temple");
      testTemple = templeRes.body.data;

      const listRes = await request(app).get("/api/v1/puja/temples");
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some((t: any) => t.id === testTemple.id)).toBe(true);
    });
  });

  // ==========================================
  // SECTION 2: PUJA SERVICE CREATION & BOOKING WORKFLOW
  // ==========================================
  describe("2. Puja Services & Devotee Booking", () => {
    it("should allow Super Admin to create a rich Puja Service with packages and add-ons", async () => {
      const serviceRes = await request(app)
        .post("/api/v1/admin/marketplace/puja/services")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          categoryId: seededCategory.id,
          templeId: testTemple.id,
          name: "Maha Rudrabhishek with Bilva Patra Archana",
          shortDescription: "Sacred abhishekam of Shiva Lingam performed with panchamrit and 1008 bilva leaves.",
          detailedDescription: "Detailed Vedic ritual conducted by certified Kashi priests invoking health, prosperity and peace.",
          durationMinutes: 90,
          regularPricePaise: 510000,
          discountedPricePaise: 450000,
          packages: [
            {
              packageName: "Samuhik Rudrabhishek",
              description: "Group puja with name and gotra sankalp recitation",
              pricePaise: 210000,
              maxParticipants: 2
            },
            {
              packageName: "Individual Sampoorna Rudrabhishek",
              description: "Exclusive puja for single family with live video stream and prasad dispatch",
              pricePaise: 510000,
              maxParticipants: 5
            }
          ],
          addOns: [
            {
              name: "108 Bilva Patra Special Archana",
              description: "Fresh Bilva leaves offered individually with Shiva Sahasranama",
              pricePaise: 50100,
              type: "SAMAGRI"
            }
          ]
        });

      expect(serviceRes.status).toBe(201);
      expect(serviceRes.body.success).toBe(true);
      expect(serviceRes.body.data.packages.length).toBe(2);
      expect(serviceRes.body.data.addOns.length).toBe(1);

      testPujaService = serviceRes.body.data;
      testPackage = serviceRes.body.data.packages[1]; // Individual package (5100.00)
    });

    it("should allow devotee to book a puja with Sankalp participants and 18% GST calculation", async () => {
      const addOn = testPujaService.addOns[0]; // 501.00
      const bookingRes = await request(app)
        .post("/api/v1/puja/bookings")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          pujaServiceId: testPujaService.id,
          packageId: testPackage.id,
          isLiveOnline: true,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          timeSlot: "08:00 AM - 09:30 AM",
          sankalpName: "Aarav Sharma",
          gotra: "Kashyapa",
          sankalpWish: "Special prayers for family health and prosperity.",
          specialInstructions: "Offer silver bilva leaf during archana.",
          participants: [
            {
              fullName: "Aarav Sharma",
              relationship: "Self",
              gotra: "Kashyapa"
            },
            {
              fullName: "Priya Sharma",
              relationship: "Spouse",
              gotra: "Kashyapa"
            }
          ],
          addOnIds: [addOn.id]
        });

      expect(bookingRes.status).toBe(201);
      expect(bookingRes.body.success).toBe(true);

      const booking = bookingRes.body.data;
      expect(booking.bookingNumber).toMatch(/^NA-PUJA-/);
      expect(booking.status).toBe("CONFIRMED");
      expect(BigInt(booking.totalAmountPaise)).toBeGreaterThan(0n);

      testBookingId = booking.id;
    });

    it("should list devotee bookings", async () => {
      const res = await request(app)
        .get("/api/v1/puja/my-bookings")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((b: any) => b.id === testBookingId)).toBe(true);
    });
  });

  // ==========================================
  // SECTION 3: PANDIT ONBOARDING, KYC & RITUAL EXECUTION
  // ==========================================
  describe("3. Pandit Partner System & Ritual Lifecycle", () => {
    it("should allow a priest to submit a Pandit Partner application", async () => {
      const applyRes = await request(app)
        .post("/api/v1/pandit/apply")
        .set("Authorization", `Bearer ${panditToken}`)
        .send({
          displayName: "Acharya Vidyadhar Shastri",
          experienceYears: 12,
          languages: ["Sanskrit", "Hindi", "English"],
          specialisations: ["Vedic Karmakand", "Rudrabhishek", "Maha Mrityunjaya"],
          serviceLocations: ["Varanasi", "Online"],
          templeId: testTemple.id,
          idVerificationDocUrl: "https://namhastro.com/docs/acharya_aadhar.pdf",
          qualificationDocs: ["https://namhastro.com/docs/sampurnanand_degree.pdf"]
        });

      expect(applyRes.status).toBe(201);
      expect(applyRes.body.success).toBe(true);
      expect(applyRes.body.data.verificationStage).toBe("APPLIED");
      panditProfileId = applyRes.body.data.id;

      // Verify user role was upgraded to PANDIT
      const user = await prisma.user.findUnique({ where: { id: panditUser.id } });
      expect(user?.role).toBe("PANDIT");

      // Refresh pandit token with PANDIT role
      panditToken = AuthService.generateAccessToken({
        userId: panditUser.id,
        role: "PANDIT",
        phoneE164: panditUser.phoneE164,
        email: panditUser.email
      });
    });

    it("should allow Super Admin to approve Pandit KYC and activate profile", async () => {
      const statusRes = await request(app)
        .patch(`/api/v1/admin/marketplace/pandits/${panditProfileId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ stage: "APPROVED" });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.data.verificationStage).toBe("APPROVED");
      expect(statusRes.body.data.isAvailable).toBe(true);
    });

    it("should allow Super Admin to assign the pandit to devotee's confirmed booking", async () => {
      const assignRes = await request(app)
        .post(`/api/v1/admin/marketplace/puja/bookings/${testBookingId}/assign-pandit`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ panditId: panditProfileId });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.success).toBe(true);
      expect(assignRes.body.data.status).toBe("PANDIT_ASSIGNED");
      expect(assignRes.body.data.panditId).toBe(panditProfileId);
    });

    it("should allow assigned pandit to view dashboard and accept booking", async () => {
      const dashRes = await request(app)
        .get("/api/v1/pandit/dashboard")
        .set("Authorization", `Bearer ${panditToken}`);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.success).toBe(true);
      expect(dashRes.body.data.upcomingBookings.length).toBeGreaterThanOrEqual(1);

      const acceptRes = await request(app)
        .post(`/api/v1/pandit/bookings/${testBookingId}/respond`)
        .set("Authorization", `Bearer ${panditToken}`)
        .send({ action: "ACCEPT" });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.status).toBe("ACCEPTED");
    });

    it("should generate Agora RTC token and start live online puja session", async () => {
      const startRes = await request(app)
        .post(`/api/v1/pandit/bookings/${testBookingId}/start`)
        .set("Authorization", `Bearer ${panditToken}`);

      expect(startRes.status).toBe(200);
      expect(startRes.body.success).toBe(true);
      expect(startRes.body.data.status).toBe("IN_PROGRESS");
      expect(startRes.body.data.agoraChannel).toBeDefined();
      expect(startRes.body.data.agoraToken).toBeDefined();
    });

    it("should allow pandit to complete ritual with evidence media and prasad tracking", async () => {
      const completeRes = await request(app)
        .post(`/api/v1/pandit/bookings/${testBookingId}/complete`)
        .set("Authorization", `Bearer ${panditToken}`)
        .send({
          completionNotes: "Vedic Maha Rudrabhishek concluded auspiciously with Bilva Patra and Mahamrityunjaya chanting.",
          photos: [
            "https://namhastro.com/uploads/puja/shiva_lingam_abhishekam.jpg",
            "https://namhastro.com/uploads/puja/sankalp_fire_ritual.jpg"
          ],
          prasadShipped: true,
          prasadTrackingNumber: "BD992834199IN"
        });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.success).toBe(true);
      expect(completeRes.body.data.status).toBe("COMPLETED");
      expect(completeRes.body.data.prasadTrackingNumber).toBe("BD992834199IN");
    });
  });

  // ==========================================
  // SECTION 4: ASTRO STORE E-COMMERCE & CART
  // ==========================================
  describe("4. Astro Store & E-commerce Workflow", () => {
    it("should seed and retrieve all 16 standard product categories", async () => {
      const res = await request(app).get("/api/v1/store/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(16);

      const rudrakshaCat = res.body.data.find((c: any) => c.slug === "rudraksha");
      expect(rudrakshaCat).toBeDefined();
      expect(rudrakshaCat.name).toBe("Rudraksha");
      seededProductCat = rudrakshaCat;
    });

    it("should allow Super Admin to create a spiritual product with stock", async () => {
      const productRes = await request(app)
        .post("/api/v1/admin/marketplace/store/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          categoryId: seededProductCat.id,
          name: "Original 5 Mukhi Nepali Rudraksha Mala",
          sku: `RUD-5M-MAL-${Date.now().toString().slice(-4)}`,
          shortDescription: "Authentic 108+1 certified Nepal Rudraksha beads strung in pure silver capping.",
          detailedDescription: "Consecrated under traditional Shiva mantras for mental peace, lower stress and spiritual awareness.",
          regularPricePaise: 450000,
          salePricePaise: 350000,
          costPricePaise: 180000,
          stockQuantity: 25,
          material: "Organic Nepali Elaeocarpus Ganitrus",
          origin: "Nepal",
          coverImageUrl: "/images/store-rudraksha.svg"
        });

      expect(productRes.status).toBe(201);
      expect(productRes.body.success).toBe(true);

      testProduct = productRes.body.data;
    });

    it("should allow customer to add product to cart and update quantity", async () => {
      // 1. Add item to cart
      const addRes = await request(app)
        .post("/api/v1/store/cart/add")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          productId: testProduct.id,
          quantity: 2
        });

      expect(addRes.status).toBe(200);
      expect(addRes.body.success).toBe(true);

      // 2. Fetch cart and inspect contents
      const getCartRes = await request(app)
        .get("/api/v1/store/cart")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(getCartRes.status).toBe(200);
      expect(getCartRes.body.success).toBe(true);
      expect(getCartRes.body.data.itemCount).toBe(2);
      expect(getCartRes.body.data.subtotalInr).toBe("7000.00"); // 2 * 3500
    });

    it("should process store order checkout with atomic stock reservation and 18% GST", async () => {
      const orderRes = await request(app)
        .post("/api/v1/store/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          items: [{ productId: testProduct.id, quantity: 2 }],
          shippingAddress: {
            fullName: "Aarav Sharma",
            phone: "+919876543210",
            addressLine1: "Flat 402, Shanti Vihar",
            city: "Varanasi",
            state: "Uttar Pradesh",
            pincode: "221001"
          }
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);

      const order = orderRes.body.data;
      expect(order.orderNumber).toMatch(/^NA-ORD-/);
      expect(order.status).toBe("CONFIRMED");
      expect(order.items.length).toBe(1);

      testStoreOrderId = order.id;

      // Verify stock was decremented
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id }
      });
      expect(updatedProduct?.stockQuantity).toBe(23); // 25 - 2
    });

    it("should allow Super Admin to update shipment status with AWB tracking", async () => {
      const shipRes = await request(app)
        .patch(`/api/v1/admin/marketplace/store/orders/${testStoreOrderId}/shipment`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "SHIPPED",
          shippingProvider: "Delhivery",
          awbNumber: "DLV8839201994",
          trackingUrl: "https://delhivery.com/track/DLV8839201994"
        });

      expect(shipRes.status).toBe(200);
      expect(shipRes.body.success).toBe(true);
      expect(shipRes.body.data.status).toBe("SHIPPED");
      expect(shipRes.body.data.awbNumber).toBe("DLV8839201994");
    });

    it("should allow customer to file a return request for store order", async () => {
      const returnRes = await request(app)
        .post(`/api/v1/store/orders/${testStoreOrderId}/return`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          type: "EXCHANGE",
          reason: "Bead size is smaller than expected, requesting collector grade exchange."
        });

      expect(returnRes.status).toBe(201);
      expect(returnRes.body.success).toBe(true);
      expect(returnRes.body.data.status).toBe("REQUESTED");
      expect(returnRes.body.data.type).toBe("EXCHANGE");
    });
  });

  // ==========================================
  // SECTION 5: REFERRAL & MARKETING AUTOMATION
  // ==========================================
  describe("5. Referral, Coupons & Marketing Engine", () => {
    it("should generate a personalized referral code and WhatsApp sharing link", async () => {
      const refRes = await request(app)
        .get("/api/v1/marketing/referral")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(refRes.status).toBe(200);
      expect(refRes.body.success).toBe(true);
      expect(refRes.body.data.referralCode).toBeDefined();
      expect(refRes.body.data.shareLink).toContain(refRes.body.data.referralCode);
    });

    it("should validate and apply percentage and fixed discount coupons", async () => {
      // 1. Seed a 15% discount coupon
      await prisma.coupon.upsert({
        where: { code: "DIWALI15" },
        update: {},
        create: {
          code: "DIWALI15",
          campaignName: "Diwali Special Offer",
          discountType: "PERCENTAGE",
          discountValue: 15,
          minOrderAmountPaise: 100000n, // Rs 1000
          maxDiscountPaise: 50000n,    // Rs 500 max cap
          usageLimit: 1000,
          isActive: true
        }
      });

      // 2. Validate coupon with eligible order value (Rs 2000 -> 200000 paise)
      const validRes = await request(app)
        .post("/api/v1/marketing/coupons/validate")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          code: "DIWALI15",
          orderAmountPaise: 200000
        });

      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
      expect(validRes.body.data.valid).toBe(true);
      expect(validRes.body.data.discountInr).toBe("300.00");

      // 3. Test ineligible below min order threshold (Rs 500 -> 50000 paise)
      const ineligRes = await request(app)
        .post("/api/v1/marketing/coupons/validate")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          code: "DIWALI15",
          orderAmountPaise: 50000
        });

      expect(ineligRes.status).toBe(400);
      expect(ineligRes.body.success).toBe(false);
      expect(ineligRes.body.error).toContain("MINIMUM_ORDER_PAISE");
    });

    it("should seed and retrieve active marketing CMS banners", async () => {
      const bannerRes = await request(app).get("/api/v1/marketing/banners");
      expect(bannerRes.status).toBe(200);
      expect(bannerRes.body.success).toBe(true);
      expect(bannerRes.body.data.length).toBeGreaterThanOrEqual(1);

      const heroBanner = bannerRes.body.data.find((b: any) => b.location === "HOMEPAGE_HERO");
      expect(heroBanner).toBeDefined();
    });

    it("should allow Super Admin to adjust product inventory stock", async () => {
      const adjustRes = await request(app)
        .post(`/api/v1/admin/marketplace/store/products/${testProduct.id}/stock-adjustment`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          adjustmentQuantity: 20,
          reason: "Received new certified consignment from Kathmandu"
        });

      expect(adjustRes.status).toBe(200);
      expect(adjustRes.body.success).toBe(true);
      expect(adjustRes.body.data.stockQuantity).toBe(43); // 23 + 20
    });
  });
});
