import agoraTokenPkg from "agora-token";
import { env } from "../config/env.js";
import { prisma } from "../db.js";

// Handle CJS/ESM interop safely
const agoraToken: any = (agoraTokenPkg as any).default || agoraTokenPkg;
const RtcTokenBuilder = agoraToken.RtcTokenBuilder;
const RtcRole = agoraToken.RtcRole || { PUBLISHER: 1, SUBSCRIBER: 2 };

/**
 * Stable integer hash for string IDs to generate Agora 32-bit uint UIDs
 */
export function stringToUint32(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 4294967295 || 10001;
}

export interface MintTokenParams {
  channelName: string;
  uid?: number | string;
  role?: "publisher" | "subscriber";
  expireSeconds?: number;
}

export interface MintTokenResult {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  role: string;
  expiresInSeconds: number;
  provider: string;
}

export class RtcService {
  /**
   * Mint an ephemeral Agora RTC AccessToken2
   */
  static mintToken(params: MintTokenParams): MintTokenResult {
    const appId = env.RTC_APP_ID;
    const appCert = env.RTC_APP_CERTIFICATE;
    if (!appId || !appCert) {
      throw new Error("Missing Agora RTC credentials in environment configuration.");
    }
    const channelName = params.channelName.trim();
    const expireSeconds = params.expireSeconds || 3600;

    let numericUid: number;
    if (typeof params.uid === "number") {
      numericUid = Math.max(1, params.uid);
    } else if (typeof params.uid === "string" && params.uid.length > 0) {
      numericUid = stringToUint32(params.uid);
    } else {
      numericUid = Math.floor(Math.random() * 899999) + 100000;
    }

    const role = params.role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    // Build standard RTC token with UID
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCert,
      channelName,
      numericUid,
      role,
      expireSeconds,
      expireSeconds
    );

    return {
      appId,
      channelName,
      token,
      uid: numericUid,
      role: params.role || "publisher",
      expiresInSeconds: expireSeconds,
      provider: "agora",
    };
  }

  /**
   * Mint token and persist audit log in database
   */
  static async mintAndAuditToken(params: {
    consultationId: string;
    userId: string;
    channelName: string;
    role?: "publisher" | "subscriber";
    expireSeconds?: number;
    clientIp?: string;
    userAgent?: string;
  }): Promise<MintTokenResult> {
    const tokenData = this.mintToken({
      channelName: params.channelName,
      uid: params.userId,
      role: params.role || "publisher",
      expireSeconds: params.expireSeconds || 3600,
    });

    try {
      await prisma.rTCTokenAudit.create({
        data: {
          consultationId: params.consultationId,
          userId: params.userId,
          channelName: params.channelName,
          role: tokenData.role,
          numericUid: BigInt(tokenData.uid),
          expiresInSeconds: tokenData.expiresInSeconds,
          clientIp: params.clientIp || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      console.warn("[RtcService] Failed to record token audit:", err);
    }

    return tokenData;
  }

  /**
   * Generate canonical channel name for a consultation
   */
  static getChannelName(consultationId: string): string {
    return `na_consult_${consultationId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  }

  /**
   * Get or create persistent RTC Channel record in database
   */
  static async getOrCreateChannel(consultationId: string, callType: string = "AUDIO"): Promise<any> {
    const channelName = this.getChannelName(consultationId);
    let channel = await prisma.rTCChannel.findUnique({
      where: { consultationId },
    });

    if (!channel) {
      channel = await prisma.rTCChannel.create({
        data: {
          consultationId,
          channelName,
          provider: "agora",
          callType,
          status: "IDLE",
        },
      });
    }

    return channel;
  }

  /**
   * Record connection events (e.g. JOINED, MUTED, CAMERA_TOGGLED, RECONNECTING, LEFT)
   */
  static async recordConnectionEvent(params: {
    consultationId: string;
    userId?: string;
    eventType: string;
    detailsJson?: any;
  }): Promise<void> {
    try {
      const channel = await this.getOrCreateChannel(params.consultationId);
      await prisma.callConnectionEvent.create({
        data: {
          channelId: channel.id,
          consultationId: params.consultationId,
          userId: params.userId || null,
          eventType: params.eventType,
          detailsJson: params.detailsJson || null,
        },
      });

      // Update participant status if applicable
      if (params.userId && (params.eventType === "JOINED" || params.eventType === "LEFT")) {
        const numericUid = BigInt(stringToUint32(params.userId));
        if (params.eventType === "JOINED") {
          await prisma.rTCParticipant.upsert({
            where: {
              id: `${channel.id}_${params.userId}`,
            },
            create: {
              id: `${channel.id}_${params.userId}`,
              channelId: channel.id,
              userId: params.userId,
              role: "PUBLISHER",
              numericUid,
              joinedAt: new Date(),
            },
            update: {
              leftAt: null,
              reconnectCount: { increment: 1 },
            },
          });
        } else if (params.eventType === "LEFT") {
          await prisma.rTCParticipant.updateMany({
            where: {
              channelId: channel.id,
              userId: params.userId,
            },
            data: {
              leftAt: new Date(),
            },
          });
        }
      }
    } catch (err) {
      console.warn("[RtcService] Failed to record connection event:", err);
    }
  }

  /**
   * Record network quality metrics from Web/Android client
   */
  static async recordQualityMetric(params: {
    consultationId: string;
    userId: string;
    networkQuality: number;
    uplinkBitrateKbps?: number;
    downlinkBitrateKbps?: number;
    packetLossRate?: number;
    rttMs?: number;
  }): Promise<void> {
    try {
      const channel = await this.getOrCreateChannel(params.consultationId);
      await prisma.callQualityMetric.create({
        data: {
          channelId: channel.id,
          consultationId: params.consultationId,
          userId: params.userId,
          networkQuality: Math.max(1, Math.min(6, params.networkQuality)),
          uplinkBitrateKbps: params.uplinkBitrateKbps || null,
          downlinkBitrateKbps: params.downlinkBitrateKbps || null,
          packetLossRate: params.packetLossRate || null,
          rttMs: params.rttMs || null,
        },
      });
    } catch (err) {
      console.warn("[RtcService] Failed to record quality metric:", err);
    }
  }
}
