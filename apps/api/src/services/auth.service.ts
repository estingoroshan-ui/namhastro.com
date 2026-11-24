import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db.js";

export interface TokenPayload {
  userId: string;
  role: string;
  phoneE164?: string | null;
  email?: string | null;
}

export class AuthService {
  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  static generateOTP(): { otp: string; otpHash: string } {
    // Generate secure 6-digit numeric OTP
    const otpNumber = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto
      .createHmac("sha256", env.JWT_ACCESS_SECRET)
      .update(otpNumber)
      .digest("hex");
    return { otp: otpNumber, otpHash };
  }

  static verifyOTPHash(otp: string, storedHash: string): boolean {
    const computedHash = crypto
      .createHmac("sha256", env.JWT_ACCESS_SECRET)
      .update(otp)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  }

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
      issuer: "namhastro-auth",
    });
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: "namhastro-auth",
    }) as TokenPayload;
  }

  static async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; sessionExpiresAt: Date }> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash,
        userAgent: userAgent?.slice(0, 512),
        ipAddress: ipAddress?.slice(0, 64),
        expiresAt,
      },
    });

    const accessToken = this.generateAccessToken({
      userId: user.id,
      role: user.role,
      phoneE164: user.phoneE164,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
      sessionExpiresAt: expiresAt,
    };
  }

  static async refreshSession(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const refreshTokenHash = this.hashToken(refreshToken);

    const session = await prisma.authSession.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user || session.user.status === "SUSPENDED" || session.user.status === "DELETED") {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // Rotate refresh token (revoke current, create new)
    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = this.generateRefreshToken();
    const newRefreshTokenHash = this.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.authSession.create({
      data: {
        userId: session.userId,
        refreshTokenHash: newRefreshTokenHash,
        userAgent: userAgent?.slice(0, 512),
        ipAddress: ipAddress?.slice(0, 64),
        expiresAt: newExpiresAt,
      },
    });

    const accessToken = this.generateAccessToken({
      userId: session.user.id,
      role: session.user.role,
      phoneE164: session.user.phoneE164,
      email: session.user.email,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  static async revokeSession(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashToken(refreshToken);
    await prisma.authSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
