import http from "node:http";
import { PrismaClient } from "@prisma/client";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initSocketServer } from "./services/socket.service.js";

const prisma = env.DATABASE_URL ? new PrismaClient() : null;

async function checkDatabase(): Promise<"connected" | "disconnected" | "unconfigured"> {
  if (!prisma) return "unconfigured";
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch {
    return "disconnected";
  }
}

const app = createApp({ checkDatabase });
const server = http.createServer(app);

// Initialize real-time WebSocket / Socket.IO server
initSocketServer(server);

server.listen(env.API_PORT, "127.0.0.1", () => {
  console.log(`[NAMH ASTRO API] Listening with Socket.IO on http://127.0.0.1:${env.API_PORT}`);
});
