import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("NAMH ASTRO API — Step 1 & Step 3 Foundation", () => {
  const app = createApp({
    checkDatabase: async () => "connected",
  });

  it("GET /api/v1/health returns 200 with diagnostics and security headers", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("namhastro-api");
    expect(res.body.step).toBe(4);
    expect(res.body.dependencies.mysql).toBe("connected");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("GET /api/v1/docs returns OpenAPI 3.1 contract", async () => {
    const res = await request(app).get("/api/v1/docs");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.info.title).toContain("NAMH ASTRO");
  });

  it("GET /api/v1/meta/architecture returns brand tokens and 12 execution steps", async () => {
    const res = await request(app).get("/api/v1/meta/architecture");

    expect(res.status).toBe(200);
    expect(res.body.brand.palette.warmIvory).toBe("#FAF7F2");
    expect(res.body.executionSteps).toHaveLength(12);
  });

  it("GET /api/v1/meta/routes supports surface filtering", async () => {
    const res = await request(app).get("/api/v1/meta/routes?surface=Public Web");

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(
      res.body.routes.every((route: { surface: string }) => route.surface === "Public Web")
    ).toBe(true);
  });

  it("returns 404 JSON for unknown endpoints", async () => {
    const res = await request(app).get("/api/v1/unknown-endpoint");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});
