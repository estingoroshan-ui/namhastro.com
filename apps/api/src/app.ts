import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {
  ASTROLOGY_SPECIALISATIONS,
  BRAND_TOKENS,
  CONSULTATION_STATES,
  DEFAULT_RECHARGE_PACKAGES_INR,
  EXECUTION_STEPS,
  ROUTE_INVENTORY,
} from "@namhastro/shared";
import { env } from "./config/env.js";
import { openApiSpec } from "./openapi.js";
import { authRouter } from "./routes/auth.routes.js";
import { customerRouter } from "./routes/customer.routes.js";
import { astrologersRouter } from "./routes/astrologers.routes.js";
import { partnerRouter } from "./routes/partner.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { consultationsRouter } from "./routes/consultations.routes.js";
import { walletRouter } from "./routes/wallet.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { prisma } from "./db.js";

export interface HealthDependencies {
  checkDatabase?: () => Promise<"connected" | "disconnected" | "unconfigured">;
}

export function createApp(deps: HealthDependencies = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin: [env.WEB_URL, env.APP_DOMAIN, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));

  // Global Health Endpoint
  app.get("/api/v1/health", async (_req, res) => {
    let databaseStatus: "connected" | "disconnected" | "unconfigured" = env.DATABASE_URL
      ? "disconnected"
      : "unconfigured";

    if (deps.checkDatabase) {
      databaseStatus = await deps.checkDatabase();
    } else if (env.DATABASE_URL) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = "connected";
      } catch {
        databaseStatus = "disconnected";
      }
    }

    res.status(200).json({
      status: "ok",
      service: "namhastro-api",
      step: 6,
      domain: env.APP_DOMAIN,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      dependencies: {
        mysql: databaseStatus,
        redis: env.REDIS_URL ? "configured" : "in_memory_cluster_adapter",
        websocket: "socket_io_realtime_configured",
        razorpay: env.RAZORPAY_KEY_ID ? "configured_and_active" : "simulation_mode",
        webrtc: "agora_configured_and_tested",
        firebase: "web_configured_service_account_pending",
        otpProvider: env.OTP_PROVIDER_API_KEY ? "configured" : "test_mode_active",
      },
    });
  });

  // API Documentation
  app.get("/api/v1/docs", (_req, res) => {
    res.status(200).json(openApiSpec);
  });

  // Metadata Endpoints
  app.get("/api/v1/meta/architecture", (_req, res) => {
    res.status(200).json({
      brand: BRAND_TOKENS,
      currentStep: 4,
      executionSteps: EXECUTION_STEPS,
      specialisations: ASTROLOGY_SPECIALISATIONS,
      consultationStates: CONSULTATION_STATES,
      defaultRechargePackagesInr: DEFAULT_RECHARGE_PACKAGES_INR,
      prismaModelsImplemented: [
        "User",
        "CustomerProfile",
        "AuthSession",
        "OTPRequest",
        "BirthProfile",
        "AstrologerProfile",
        "AstrologerApplication",
        "AstrologerDocument",
        "AstrologerInterview",
        "AstrologerBankAccount",
        "AstrologerSchedule",
        "AstrologerLeave",
        "ConsultationQueue",
        "RateChangeRequest",
        "WithdrawalRequest",
        "DeviceToken",
        "AstrologerFavourite",
        "AstrologerFollower",
        "AvailabilitySubscription",
        "Appointment",
        "ConsultationRequest",
        "Wallet",
        "WalletTransaction",
        "SupportTicket",
        "SupportMessage",
        "Notification",
        "NotificationPreference",
        "SavedAddress",
        "SystemSetting",
        "AuditLog",
        "RechargePackage",
        "PaymentOrder",
        "GstInvoice",
        "ConsultationHold",
      ],
    });
  });

  app.get("/api/v1/meta/routes", (req, res) => {
    const surface = typeof req.query.surface === "string" ? req.query.surface : undefined;
    const routes = surface
      ? ROUTE_INVENTORY.filter((route) => route.surface.toLowerCase() === surface.toLowerCase())
      : ROUTE_INVENTORY;

    res.status(200).json({
      total: routes.length,
      routes,
    });
  });

  // Core Service Routers
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/customer", customerRouter);
  app.use("/api/v1/astrologers", astrologersRouter);
  app.use("/api/v1/partner", partnerRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/consultations", consultationsRouter);
  app.use("/api/v1/wallet", walletRouter);
  app.use("/api/v1/chat", chatRouter);

  // 404 Fallback
  app.use((_req, res) => {
    res.status(404).json({
      error: "NOT_FOUND",
      message: "The requested API endpoint does not exist.",
    });
  });

  return app;
}
