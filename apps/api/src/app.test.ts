import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("NAMH ASTRO API — Step 1 Foundation", () => {
  const app = createApp({
    checkDatabase: async () => "unconfigured",
  });

  it("GET /api/v1/health returns 200 with diagnostics and security headers", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("namhastro-api");
    expect(res.body.step).toBe(1);
    expect(res.body.dependencies.mysql).toBe("unconfigured");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("GET /api/v1/docs returns OpenAPI 3.1 contract", async () => {
    const res = await request(app).get("/api/v1/docs");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.paths["/api/v1/health"]).toBeDefined();
  });

  it("GET /api/v1/meta/architecture returns brand tokens and 12 execution steps", async () => {
    const res = await request(app).get("/api/v1/meta/architecture");
    expect(res.status).toBe(200);
    expect(res.body.brand.name).toBe("NAMH ASTRO");
    expect(res.body.executionSteps).toHaveLength(12);
    expect(res.body.specialisations).toHaveLength(15);
  });

  it("GET /api/v1/meta/routes supports surface filtering", async () => {
    const allRes = await request(app).get("/api/v1/meta/routes");
    expect(allRes.status).toBe(200);
    expect(allRes.body.total).toBeGreaterThan(10);

    const apiRes = await request(app).get("/api/v1/meta/routes?surface=REST%20API%20v1");
    expect(apiRes.status).toBe(200);
    expect(apiRes.body.total).toBe(4);
  });

  it("returns 404 JSON for unknown endpoints", async () => {
    const res = await request(app).get("/api/v1/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});
