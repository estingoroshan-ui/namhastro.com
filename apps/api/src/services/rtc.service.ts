import agoraTokenPkg from "agora-token";
import { env } from "../config/env.js";

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
    const appId = env.RTC_APP_ID || "5d066243097b4c148739c771cc1cdcd0";
    const appCert = env.RTC_APP_CERTIFICATE || "1ee664578cb84cc1a73be4e4a27c8faf";
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
   * Generate canonical channel name for a consultation
   */
  static getChannelName(consultationId: string): string {
    return `na_consult_${consultationId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  }
}
