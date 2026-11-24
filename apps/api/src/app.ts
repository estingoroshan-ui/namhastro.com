import cors from "cors";
import express from "express";
import helmet from "helmet";
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

export interface HealthDependencies {
  checkDatabase?: () => Promise<"connected" | "disconnected" | "unconfigured">;
}

export function createApp(deps: HealthDependencies = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: [env.WEB_URL, env.APP_DOMAIN, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/v1/health", async (_req, res) => {
    let databaseStatus: "connected" | "disconnected" | "unconfigured" = env.DATABASE_URL
      ? "disconnected"
      : "unconfigured";

    if (deps.checkDatabase) {
      databaseStatus = await deps.checkDatabase();
    }

    res.status(200).json({
      status: "ok",
      service: "namhastro-api",
      step: 1,
      domain: env.APP_DOMAIN,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      dependencies: {
        mysql: databaseStatus,
        redis: env.REDIS_URL ? "configured_pending_step_6" : "unconfigured",
        razorpay: "unconfigured_pending_step_5",
        webrtc: "unconfigured_pending_step_7",
      },
    });
  });

  app.get("/api/v1/docs", (_req, res) => {
    res.status(200).json(openApiSpec);
  });

  app.get("/api/v1/meta/architecture", (_req, res) => {
    res.status(200).json({
      brand: BRAND_TOKENS,
      currentStep: 1,
      executionSteps: EXECUTION_STEPS,
      specialisations: ASTROLOGY_SPECIALISATIONS,
      consultationStates: CONSULTATION_STATES,
      defaultRechargePackagesInr: DEFAULT_RECHARGE_PACKAGES_INR,
      prismaModelsImplemented: [
        "User",
        "AstrologerProfile",
        "Wallet",
        "WalletTransaction",
        "SystemSetting",
        "AuditLog",
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

  app.use((_req, res) => {
    res.status(404).json({
      error: "NOT_FOUND",
      message: "The requested API endpoint does not exist in Step 1.",
    });
  });

  return app;
}
