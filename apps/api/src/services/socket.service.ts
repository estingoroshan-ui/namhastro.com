import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { AuthService } from "./auth.service.js";
import { prisma } from "../db.js";
import { BillingService } from "./billing.service.js";
import { FirebaseService } from "./firebase.service.js";
import { env } from "../config/env.js";

interface ActiveSession {
  consultationId: string;
  customerId: string;
  astrologerUserId: string;
  ratePaisePerMinute: number;
  maxDurationSeconds: number;
  startedAt: number;
  timerInterval?: NodeJS.Timeout;
}

let io: SocketIOServer | null = null;
const activeSessions = new Map<string, ActiveSession>();

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToConsultation(consultationId: string, event: string, data: any): void {
  if (!io) return;
  io.to(`consultation:${consultationId}`).emit(event, data);
}

export function startConsultationTimer(params: {
  consultationId: string;
  customerId: string;
  astrologerUserId: string;
  ratePaisePerMinute: number;
  maxDurationSeconds: number;
}): void {
  const { consultationId, customerId, astrologerUserId, ratePaisePerMinute, maxDurationSeconds } = params;

  if (activeSessions.has(consultationId)) {
    return;
  }

  const startedAt = Date.now();
  const session: ActiveSession = {
    consultationId,
    customerId,
    astrologerUserId,
    ratePaisePerMinute,
    maxDurationSeconds,
    startedAt,
  };

  // Heartbeat every 5 seconds for authoritative server-side countdown
  const timer = setInterval(async () => {
    const elapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);
    const remainingSeconds = Math.max(0, session.maxDurationSeconds - elapsedSeconds);
    const billableMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    const currentChargeInr = (billableMinutes * session.ratePaisePerMinute) / 100;

    emitToConsultation(consultationId, "consultation:tick", {
      consultationId,
      elapsedSeconds,
      remainingSeconds,
      billableMinutes,
      currentChargeInr,
    });

    // Low balance warnings at 3m (180s), 1m (60s), and 30s
    if (remainingSeconds === 180 || remainingSeconds === 60 || remainingSeconds === 30) {
      emitToConsultation(consultationId, "consultation:low_balance", {
        consultationId,
        remainingSeconds,
        warning: `Consultation will end in ${remainingSeconds} seconds due to available balance limit. Please recharge to continue seamlessly.`,
      });

      emitToUser(session.customerId, "consultation:low_balance", {
        consultationId,
        remainingSeconds,
      });
    }

    // Auto-terminate when balance exhausts
    if (remainingSeconds <= 0) {
      clearInterval(timer);
      activeSessions.delete(consultationId);

      try {
        const settlement = await BillingService.settleConsultation({
          consultationId,
          durationSeconds: elapsedSeconds,
          reason: "AUTHORITATIVE_TIMER_BALANCE_EXHAUSTED",
        });

        emitToConsultation(consultationId, "consultation:ended", {
          consultationId,
          reason: "BALANCE_EXHAUSTED",
          settlement,
        });
      } catch (err) {
        console.error(`[SocketService] Failed to auto-settle expired session ${consultationId}:`, err);
      }
    }
  }, 5000);

  session.timerInterval = timer;
  activeSessions.set(consultationId, session);
}

export function stopConsultationTimer(consultationId: string): void {
  const session = activeSessions.get(consultationId);
  if (session?.timerInterval) {
    clearInterval(session.timerInterval);
  }
  activeSessions.delete(consultationId);
}

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [env.WEB_URL, env.APP_DOMAIN, "http://localhost:3000", "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // 1. Handshake Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error("AUTHENTICATION_REQUIRED"));
      }

      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const payload = AuthService.verifyAccessToken(token);

      socket.data.user = payload;
      next();
    } catch (err: any) {
      next(new Error("INVALID_AUTH_TOKEN"));
    }
  });

  // 2. Connection Lifecycle
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    if (!user || !user.userId) {
      socket.disconnect(true);
      return;
    }

    // Join user's private notification channel
    socket.join(`user:${user.userId}`);

    // Join consultation room with authorization verification
    socket.on("join:consultation", async (payload: { consultationId: string }, callback?: (res: any) => void) => {
      try {
        const { consultationId } = payload;
        if (!consultationId) {
          if (callback) callback({ success: false, error: "CONSULTATION_ID_REQUIRED" });
          return;
        }

        const consultation = await prisma.consultationRequest.findUnique({
          where: { id: consultationId },
          include: { astrologerProfile: true, customer: true },
        });

        if (!consultation) {
          if (callback) callback({ success: false, error: "NOT_FOUND" });
          return;
        }

        // Room Access Authorization: Customer, Astrologer, or Super Admin/Support
        const isCustomer = consultation.customerId === user.userId;
        const isAstrologer = consultation.astrologerProfile.userId === user.userId;
        const isAdmin = user.role === "SUPER_ADMIN" || user.role === "SUPPORT";

        if (!isCustomer && !isAstrologer && !isAdmin) {
          if (callback) callback({ success: false, error: "UNAUTHORIZED_ROOM_ACCESS" });
          socket.emit("error", { message: "Access to this consultation room is denied." });
          return;
        }

        socket.join(`consultation:${consultationId}`);

        // Fetch recent message history (last 50)
        const messages = await prisma.chatMessage.findMany({
          where: { consultationId },
          orderBy: { createdAt: "asc" },
          take: 50,
        });

        const activeSession = activeSessions.get(consultationId);
        const elapsedSeconds = activeSession
          ? Math.floor((Date.now() - activeSession.startedAt) / 1000)
          : consultation.durationSeconds;

        const responseData = {
          success: true,
          consultationId,
          status: consultation.status,
          type: consultation.type,
          ratePaisePerMinute: consultation.ratePaisePerMinute,
          elapsedSeconds,
          messages: messages.map((m) => ({
            id: m.id,
            clientMessageId: m.clientMessageId,
            senderId: m.senderId,
            senderRole: m.senderRole,
            type: m.type,
            content: m.content,
            attachmentUrl: m.attachmentUrl,
            status: m.status,
            createdAt: m.createdAt.toISOString(),
          })),
        };

        if (callback) callback(responseData);
        socket.emit("consultation:joined", responseData);
      } catch (err: any) {
        if (callback) callback({ success: false, error: err?.message || "INTERNAL_ERROR" });
      }
    });

    // Two-way messaging
    socket.on(
      "message:send",
      async (
        payload: {
          consultationId: string;
          clientMessageId?: string;
          type?: "TEXT" | "IMAGE" | "PDF" | "VOICE" | "KUNDLI" | "SYSTEM";
          content: string;
          attachmentUrl?: string;
          attachmentMeta?: any;
        },
        callback?: (res: any) => void
      ) => {
        try {
          const { consultationId, clientMessageId, type = "TEXT", content, attachmentUrl, attachmentMeta } = payload;

          if (!consultationId || !content?.trim()) {
            if (callback) callback({ success: false, error: "INVALID_PAYLOAD" });
            return;
          }

          const consultation = await prisma.consultationRequest.findUnique({
            where: { id: consultationId },
            include: { astrologerProfile: true },
          });

          if (!consultation) {
            if (callback) callback({ success: false, error: "NOT_FOUND" });
            return;
          }

          // Verify consultation state allows messaging
          const allowedStates = ["PENDING", "ACCEPTED", "CONNECTING", "ACTIVE"];
          if (!allowedStates.includes(consultation.status)) {
            if (callback) callback({ success: false, error: "CONSULTATION_INACTIVE", message: `Consultation is ${consultation.status}` });
            return;
          }

          // Determine sender role
          let senderRole = "CUSTOMER";
          if (consultation.astrologerProfile.userId === user.userId) {
            senderRole = "ASTROLOGER";
          } else if (user.role === "SUPER_ADMIN") {
            senderRole = "SYSTEM";
          }

          // Idempotent deduplication if clientMessageId provided
          if (clientMessageId) {
            const existing = await prisma.chatMessage.findFirst({
              where: { consultationId, clientMessageId },
            });
            if (existing) {
              const resData = {
                success: true,
                message: existing,
                deduplicated: true,
              };
              if (callback) callback(resData);
              return;
            }
          }

          // Persist message to database
          const chatMsg = await prisma.chatMessage.create({
            data: {
              consultationId,
              clientMessageId: clientMessageId || null,
              senderId: user.userId,
              senderRole,
              type,
              content: content.trim(),
              attachmentUrl: attachmentUrl || null,
              attachmentMeta: attachmentMeta || null,
              status: "SENT",
            },
          });

          const msgPayload = {
            id: chatMsg.id,
            clientMessageId: chatMsg.clientMessageId,
            consultationId: chatMsg.consultationId,
            senderId: chatMsg.senderId,
            senderRole: chatMsg.senderRole,
            type: chatMsg.type,
            content: chatMsg.content,
            attachmentUrl: chatMsg.attachmentUrl,
            status: chatMsg.status,
            createdAt: chatMsg.createdAt.toISOString(),
          };

          // Broadcast to everyone in the consultation room
          io?.to(`consultation:${consultationId}`).emit("message:received", msgPayload);

          // Dispatch FCM notification to the other party
          const recipientId = senderRole === "CUSTOMER" ? consultation.astrologerProfile.userId : consultation.customerId;
          FirebaseService.sendPush({
            userId: recipientId,
            category: "NEW_CHAT_MESSAGE",
            title: `New message from ${senderRole === "CUSTOMER" ? "Customer" : consultation.astrologerProfile.displayName}`,
            body: type === "TEXT" ? content.slice(0, 80) : `Sent an attachment [${type}]`,
            actionUrl: `/consultation/chat?id=${consultationId}`,
            data: { consultationId, messageId: chatMsg.id },
          }).catch(() => {});

          if (callback) callback({ success: true, data: msgPayload });
        } catch (err: any) {
          if (callback) callback({ success: false, error: err?.message || "FAILED_TO_SEND" });
        }
      }
    );

    // Typing indicators
    socket.on("message:typing", (payload: { consultationId: string; isTyping: boolean }) => {
      const { consultationId, isTyping } = payload;
      if (!consultationId) return;
      socket.to(`consultation:${consultationId}`).emit("message:typing", {
        consultationId,
        userId: user.userId,
        isTyping,
      });
    });

    // Read receipts
    socket.on("message:read", async (payload: { consultationId: string; messageIds: string[] }) => {
      try {
        const { consultationId, messageIds } = payload;
        if (!consultationId || !Array.isArray(messageIds) || messageIds.length === 0) return;

        await prisma.chatMessage.updateMany({
          where: {
            consultationId,
            id: { in: messageIds },
            senderId: { not: user.userId },
          },
          data: {
            isRead: true,
            status: "READ",
            readAt: new Date(),
          },
        });

        io?.to(`consultation:${consultationId}`).emit("message:read", {
          consultationId,
          readBy: user.userId,
          messageIds,
          readAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[SocketService] Failed to mark messages as read:", err);
      }
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      // Socket disconnected gracefully
    });
  });

  return io;
}
