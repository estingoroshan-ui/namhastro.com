import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { AuthService } from "./auth.service.js";
import { prisma } from "../db.js";
import { BillingService } from "./billing.service.js";
import { FirebaseService } from "./firebase.service.js";
import { RtcService } from "./rtc.service.js";
import { env } from "../config/env.js";

interface ActiveSession {
  consultationId: string;
  customerId: string;
  astrologerUserId: string;
  ratePaisePerMinute: number;
  maxDurationSeconds: number;
  startedAt: number;
  customerRtcJoined: boolean;
  astrologerRtcJoined: boolean;
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
  gateOnRtcJoin?: boolean;
}): void {
  const { consultationId, customerId, astrologerUserId, ratePaisePerMinute, maxDurationSeconds, gateOnRtcJoin = false } = params;

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
    customerRtcJoined: !gateOnRtcJoin,
    astrologerRtcJoined: !gateOnRtcJoin,
  };

  // Heartbeat every 5 seconds for authoritative server-side countdown
  const timer = setInterval(async () => {
    // If waiting for RTC join gate and not both joined, do not decrement
    if (gateOnRtcJoin && (!session.customerRtcJoined || !session.astrologerRtcJoined)) {
      emitToConsultation(consultationId, "call:waiting_peer", {
        consultationId,
        customerJoined: session.customerRtcJoined,
        astrologerJoined: session.astrologerRtcJoined,
        message: "Waiting for both participants to establish Agora RTC connection before billing begins.",
      });
      return;
    }

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
      ratePaisePerMinute: session.ratePaisePerMinute,
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

        emitToConsultation(consultationId, "call:ended", {
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

export function extendConsultationTimer(consultationId: string, additionalSeconds: number): void {
  const session = activeSessions.get(consultationId);
  if (session) {
    session.maxDurationSeconds += additionalSeconds;
    const elapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);
    const remainingSeconds = Math.max(0, session.maxDurationSeconds - elapsedSeconds);
    emitToConsultation(consultationId, "consultation:recharge_applied", {
      consultationId,
      additionalSeconds,
      newRemainingSeconds: remainingSeconds,
      message: "Wallet recharge applied! Consultation time extended seamlessly.",
    });
  }
}

export function updateConsultationTimerRate(consultationId: string, newRatePaisePerMinute: number): void {
  const session = activeSessions.get(consultationId);
  if (session) {
    session.ratePaisePerMinute = newRatePaisePerMinute;
  }
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

    // ==========================================
    // AGORA AUDIO & VIDEO CALL SIGNALING EVENTS
    // ==========================================

    // Participant establishes Agora RTC Channel connection
    socket.on(
      "call:join",
      async (
        payload: {
          consultationId: string;
          channelName: string;
          numericUid: number;
          isMutedAudio?: boolean;
          isVideoEnabled?: boolean;
        },
        callback?: (res: any) => void
      ) => {
        try {
          const { consultationId, channelName, numericUid, isMutedAudio = false, isVideoEnabled = true } = payload;
          if (!consultationId) {
            if (callback) callback({ success: false, error: "CONSULTATION_ID_REQUIRED" });
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

          const isCustomer = consultation.customerId === user.userId;
          const isAstrologer = consultation.astrologerProfile.userId === user.userId;

          if (!isCustomer && !isAstrologer) {
            if (callback) callback({ success: false, error: "UNAUTHORIZED_CALL_ACCESS" });
            return;
          }

          // Record connection event in database
          await RtcService.recordConnectionEvent({
            consultationId,
            userId: user.userId,
            eventType: "JOINED",
            detailsJson: { numericUid, isMutedAudio, isVideoEnabled },
          });

          // Update RTC Channel joined state
          const channel = await RtcService.getOrCreateChannel(consultationId, consultation.type);
          const updateData: any = {};
          if (isCustomer) updateData.customerJoined = true;
          if (isAstrologer) updateData.astrologerJoined = true;
          if (channel.status === "IDLE") updateData.status = "ACTIVE";
          if (!channel.startedAt) updateData.startedAt = new Date();

          await prisma.rTCChannel.update({
            where: { id: channel.id },
            data: updateData,
          });

          // Check if both participants are now connected
          const activeSession = activeSessions.get(consultationId);
          if (activeSession) {
            if (isCustomer) activeSession.customerRtcJoined = true;
            if (isAstrologer) activeSession.astrologerRtcJoined = true;
          }

          // Notify room of participant join
          io?.to(`consultation:${consultationId}`).emit("call:peer_joined", {
            consultationId,
            userId: user.userId,
            role: isAstrologer ? "ASTROLOGER" : "CUSTOMER",
            numericUid,
            isMutedAudio,
            isVideoEnabled,
          });

          if (callback) callback({ success: true, channelName, numericUid });
        } catch (err: any) {
          if (callback) callback({ success: false, error: err?.message || "JOIN_FAILED" });
        }
      }
    );

    // Audio mute toggle
    socket.on("call:mute", async (payload: { consultationId: string; isMuted: boolean }) => {
      const { consultationId, isMuted } = payload;
      if (!consultationId) return;

      await RtcService.recordConnectionEvent({
        consultationId,
        userId: user.userId,
        eventType: isMuted ? "MUTED_AUDIO" : "UNMUTED_AUDIO",
      });

      socket.to(`consultation:${consultationId}`).emit("call:peer_mute", {
        consultationId,
        userId: user.userId,
        isMuted,
      });
    });

    // Camera video toggle
    socket.on("call:camera", async (payload: { consultationId: string; isVideoEnabled: boolean }) => {
      const { consultationId, isVideoEnabled } = payload;
      if (!consultationId) return;

      await RtcService.recordConnectionEvent({
        consultationId,
        userId: user.userId,
        eventType: isVideoEnabled ? "CAMERA_ENABLED" : "CAMERA_DISABLED",
      });

      socket.to(`consultation:${consultationId}`).emit("call:peer_camera", {
        consultationId,
        userId: user.userId,
        isVideoEnabled,
      });
    });

    // Network quality telemetry
    socket.on(
      "call:quality",
      async (payload: {
        consultationId: string;
        networkQuality: number;
        uplinkBitrateKbps?: number;
        downlinkBitrateKbps?: number;
        packetLossRate?: number;
        rttMs?: number;
      }) => {
        const { consultationId, networkQuality, uplinkBitrateKbps, downlinkBitrateKbps, packetLossRate, rttMs } = payload;
        if (!consultationId) return;

        await RtcService.recordQualityMetric({
          consultationId,
          userId: user.userId,
          networkQuality,
          uplinkBitrateKbps,
          downlinkBitrateKbps,
          packetLossRate,
          rttMs,
        });

        // Broadcast quality indicator to peer
        socket.to(`consultation:${consultationId}`).emit("call:peer_quality", {
          consultationId,
          userId: user.userId,
          networkQuality,
        });
      }
    );

    // Reconnecting / Reconnected events
    socket.on("call:reconnecting", async (payload: { consultationId: string }) => {
      const { consultationId } = payload;
      if (!consultationId) return;

      await RtcService.recordConnectionEvent({
        consultationId,
        userId: user.userId,
        eventType: "RECONNECTING",
      });

      socket.to(`consultation:${consultationId}`).emit("call:peer_reconnecting", {
        consultationId,
        userId: user.userId,
        gracePeriodSeconds: 30,
      });
    });

    socket.on("call:reconnected", async (payload: { consultationId: string }) => {
      const { consultationId } = payload;
      if (!consultationId) return;

      await RtcService.recordConnectionEvent({
        consultationId,
        userId: user.userId,
        eventType: "RECONNECTED",
      });

      socket.to(`consultation:${consultationId}`).emit("call:peer_reconnected", {
        consultationId,
        userId: user.userId,
      });
    });

    // Audio to Video Upgrade Negotiation
    socket.on(
      "call:upgrade_request",
      async (payload: { consultationId: string }, callback?: (res: any) => void) => {
        try {
          const { consultationId } = payload;
          if (!consultationId) {
            if (callback) callback({ success: false, error: "CONSULTATION_ID_REQUIRED" });
            return;
          }

          const consultation = await prisma.consultationRequest.findUnique({
            where: { id: consultationId },
            include: { astrologerProfile: true },
          });

          if (!consultation || consultation.customerId !== user.userId) {
            if (callback) callback({ success: false, error: "UNAUTHORIZED_OR_NOT_FOUND" });
            return;
          }

          if (consultation.type !== "AUDIO") {
            if (callback) callback({ success: false, error: "CANNOT_UPGRADE", message: `Consultation is already ${consultation.type}` });
            return;
          }

          const newRatePaise = consultation.astrologerProfile.videoRatePaise || consultation.ratePaisePerMinute * 1.5;

          // Check if customer wallet has enough for at least 2 minutes at new rate
          const wallet = await prisma.wallet.findUnique({ where: { userId: user.userId } });
          const totalPaise = (wallet?.paidBalancePaise || 0n) + (wallet?.promoBalancePaise || 0n);
          if (totalPaise < BigInt(newRatePaise * 2)) {
            if (callback) callback({ success: false, error: "INSUFFICIENT_WALLET_BALANCE_FOR_UPGRADE" });
            return;
          }

          // Create upgrade request record
          const upgradeReq = await prisma.callUpgradeRequest.create({
            data: {
              consultationId,
              fromType: "AUDIO",
              toType: "VIDEO",
              newRatePaisePerMinute: Math.round(newRatePaise),
              requestedById: user.userId,
              status: "PENDING",
            },
          });

          // Forward request to astrologer
          emitToUser(consultation.astrologerProfile.userId, "call:upgrade_requested", {
            consultationId,
            upgradeRequestId: upgradeReq.id,
            fromType: "AUDIO",
            toType: "VIDEO",
            newRatePaisePerMinute: upgradeReq.newRatePaisePerMinute,
            customerName: "Customer",
          });

          if (callback) callback({ success: true, upgradeRequestId: upgradeReq.id, newRatePaise: upgradeReq.newRatePaisePerMinute });
        } catch (err: any) {
          if (callback) callback({ success: false, error: err?.message || "UPGRADE_REQUEST_FAILED" });
        }
      }
    );

    // Astrologer responds to upgrade request
    socket.on(
      "call:upgrade_respond",
      async (
        payload: {
          consultationId: string;
          upgradeRequestId: string;
          accepted: boolean;
        },
        callback?: (res: any) => void
      ) => {
        try {
          const { consultationId, upgradeRequestId, accepted } = payload;

          const upgradeReq = await prisma.callUpgradeRequest.findUnique({
            where: { id: upgradeRequestId },
            include: { consultation: { include: { astrologerProfile: true } } },
          });

          if (!upgradeReq || upgradeReq.consultation.astrologerProfile.userId !== user.userId) {
            if (callback) callback({ success: false, error: "UNAUTHORIZED_OR_NOT_FOUND" });
            return;
          }

          if (upgradeReq.status !== "PENDING") {
            if (callback) callback({ success: false, error: "ALREADY_RESPONDED" });
            return;
          }

          if (!accepted) {
            await prisma.callUpgradeRequest.update({
              where: { id: upgradeRequestId },
              data: { status: "REJECTED", respondedAt: new Date() },
            });

            emitToConsultation(consultationId, "call:upgrade_rejected", {
              consultationId,
              reason: "Astrologer declined video upgrade request. Audio consultation continues uninterrupted.",
            });

            if (callback) callback({ success: true, accepted: false });
            return;
          }

          // Accepted: Perform multi-segment transition
          const activeSession = activeSessions.get(consultationId);
          const currentElapsed = activeSession
            ? Math.floor((Date.now() - activeSession.startedAt) / 1000)
            : 60;

          // Record audio billing segment up to now
          await BillingService.recordBillingSegment({
            consultationId,
            segmentIndex: 1,
            callType: "AUDIO",
            ratePaisePerMinute: upgradeReq.consultation.ratePaisePerMinute,
            startSeconds: 0,
            endSeconds: currentElapsed,
          });

          // Update consultation to VIDEO and new rate
          await prisma.consultationRequest.update({
            where: { id: consultationId },
            data: {
              type: "VIDEO",
              ratePaisePerMinute: upgradeReq.newRatePaisePerMinute,
            },
          });

          await prisma.callUpgradeRequest.update({
            where: { id: upgradeRequestId },
            data: { status: "ACCEPTED", respondedAt: new Date() },
          });

          // Update active timer rate
          updateConsultationTimerRate(consultationId, upgradeReq.newRatePaisePerMinute);

          // Broadcast upgrade success to both parties
          emitToConsultation(consultationId, "call:upgraded", {
            consultationId,
            newType: "VIDEO",
            newRatePaisePerMinute: upgradeReq.newRatePaisePerMinute,
            effectiveAtSeconds: currentElapsed,
            message: "Consultation successfully upgraded to Video! Video camera is now active.",
          });

          if (callback) callback({ success: true, accepted: true });
        } catch (err: any) {
          if (callback) callback({ success: false, error: err?.message || "UPGRADE_RESPONSE_FAILED" });
        }
      }
    );

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
