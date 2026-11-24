export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "NAMH ASTRO Enterprise Marketplace API",
    version: "1.0.0-step1",
    description:
      "REST API v1 foundation for NAMH ASTRO (https://namhastro.com). Step 1 exposes system health, OpenAPI contract, architecture metadata, and complete route inventory.",
  },
  servers: [
    { url: "http://localhost:4000", description: "Local Development API" },
    { url: "https://api.namhastro.com", description: "Production API (Target)" },
  ],
  paths: {
    "/api/v1/health": {
      get: {
        summary: "System & database health check",
        tags: ["System"],
        responses: {
          "200": {
            description: "API is running and returns live runtime/database diagnostics",
          },
        },
      },
    },
    "/api/v1/docs": {
      get: {
        summary: "OpenAPI 3.1 JSON specification",
        tags: ["System"],
        responses: {
          "200": { description: "OpenAPI specification payload" },
        },
      },
    },
    "/api/v1/meta/architecture": {
      get: {
        summary: "Platform architecture, brand tokens, and 12-step execution plan",
        tags: ["Foundation"],
        responses: {
          "200": { description: "Architecture metadata payload" },
        },
      },
    },
    "/api/v1/meta/routes": {
      get: {
        summary: "Complete route inventory across web, mobile, admin, REST, and WebSockets",
        tags: ["Foundation"],
        responses: {
          "200": { description: "Route inventory array" },
        },
      },
    },
  },
} as const;
