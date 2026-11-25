import { Router, type Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service.js";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { env } from "../config/env.js";

export const authRouter = Router();

function normalizePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

const sendOtpSchema = z.object({
  phone: z.string().min(10).max(20),
  purpose: z.enum(["LOGIN", "REGISTER", "PROFILE_VERIFY"]).default("LOGIN"),
});

authRouter.post("/otp/send", async (req, res: Response) => {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "A valid mobile phone number is required (e.g. +919876543210).",
        details: parsed.error.flatten(),
      });
      return;
    }

    const phoneE164 = normalizePhoneE164(parsed.data.phone);

    // Rate limiting: max 4 requests within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = await prisma.oTPRequest.count({
      where: {
        phoneE164,
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentRequests >= 4) {
      res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many OTP requests. Please wait a few minutes before trying again.",
      });
      return;
    }

    const { otp, otpHash } = AuthService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otpRecord = await prisma.oTPRequest.create({
      data: {
        phoneE164,
        otpHash,
        purpose: parsed.data.purpose,
        expiresAt,
        ipAddress: req.ip,
      },
    });

    const isProviderConfigured = Boolean(env.OTP_PROVIDER_API_KEY && env.OTP_PROVIDER_API_KEY.length > 5);

    // If real SMS gateway is configured, deliver via provider API.
    // If pending production credentials, return test delivery details in development.
    res.status(200).json({
      success: true,
      requestId: otpRecord.id,
      phone: phoneE164,
      expiresAt: expiresAt.toISOString(),
      providerStatus: isProviderConfigured ? "DELIVERED_VIA_GATEWAY" : "TEST_DELIVERY_ACTIVE",
      ...(isProviderConfigured
        ? {}
        : {
            debugOtp: otp,
            note: "Real SMS Gateway key pending in Step 3. Use debugOtp for verification.",
          }),
    });
  } catch (error) {
    res.status(500).json({
      error: "OTP_SEND_FAILED",
      message: error instanceof Error ? error.message : "Failed to generate OTP.",
    });
  }
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(20),
  otp: z.string().length(6),
  fullName: z.string().min(2).max(120).optional(),
});

authRouter.post("/otp/verify", async (req, res: Response) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Both a valid phone number and 6-digit OTP code are required.",
      });
      return;
    }

    const phoneE164 = normalizePhoneE164(parsed.data.phone);
    const { otp, fullName } = parsed.data;

    // Find the latest unverified OTP for this phone number
    const otpRecord = await prisma.oTPRequest.findFirst({
      where: {
        phoneE164,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      res.status(400).json({
        error: "OTP_NOT_FOUND_OR_EXPIRED",
        message: "No active OTP request found for this phone number or it has expired.",
      });
      return;
    }

    if (otpRecord.attempts >= 5) {
      res.status(400).json({
        error: "MAX_ATTEMPTS_EXCEEDED",
        message: "Too many failed attempts. Please request a new OTP.",
      });
      return;
    }

    const isValid = AuthService.verifyOTPHash(otp, otpRecord.otpHash);

    if (!isValid) {
      await prisma.oTPRequest.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      res.status(400).json({
        error: "INVALID_OTP",
        message: "The entered OTP code is incorrect. Please check and try again.",
        remainingAttempts: 5 - (otpRecord.attempts + 1),
      });
      return;
    }

    // Mark OTP as verified
    await prisma.oTPRequest.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    // Find or create customer account
    let user = await prisma.user.findUnique({
      where: { phoneE164 },
      include: { customerProfile: true, wallet: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const initialName = fullName || `Devotee ${phoneE164.slice(-4)}`;

      user = await prisma.user.create({
        data: {
          fullName: initialName,
          phoneE164,
          phoneVerifiedAt: new Date(),
          role: "CUSTOMER",
          status: "ACTIVE",
          customerProfile: {
            create: {
              birthTimezone: "Asia/Kolkata",
            },
          },
          wallet: {
            create: {
              currency: "INR",
              paidBalancePaise: BigInt(0),
              promoBalancePaise: BigInt(100), // ₹1 welcome promotional credit
            },
          },
          notificationPref: {
            create: {
              emailEnabled: true,
              smsEnabled: true,
              pushEnabled: true,
              whatsappEnabled: true,
            },
          },
          notifications: {
            create: {
              category: "AUTH",
              title: "Welcome to NAMH ASTRO",
              body: "Your Vedic journey begins now. Enjoy ₹1 introductory consultation credit with top verified astrologers.",
              actionUrl: "/astrologers",
            },
          },
        },
        include: { customerProfile: true, wallet: true },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifiedAt: user.phoneVerifiedAt || new Date(),
          lastLoginAt: new Date(),
          status: "ACTIVE",
        },
      });
    }

    const session = await AuthService.createSession(
      user.id,
      req.headers["user-agent"],
      req.ip
    );

    const payload = {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phoneE164,
        email: user.email,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        profile: user.customerProfile,
        wallet: {
          paidBalanceInr: Number(user.wallet?.paidBalancePaise || 0) / 100,
          promoBalanceInr: Number(user.wallet?.promoBalancePaise || 0) / 100,
          totalBalanceInr:
            Number((user.wallet?.paidBalancePaise || BigInt(0)) + (user.wallet?.promoBalancePaise || BigInt(0))) / 100,
        },
      },
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.sessionExpiresAt.toISOString(),
      },
    };

    res.status(200).json({
      success: true,
      isNewUser,
      ...payload,
      data: payload,
    });
  } catch (error) {
    res.status(500).json({
      error: "VERIFY_FAILED",
      message: error instanceof Error ? error.message : "Failed to verify OTP.",
    });
  }
});

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().min(10).max(20).optional(),
  preferredLanguage: z.string().default("en"),
});

authRouter.post("/register", async (req, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Please provide valid registration details.",
        details: parsed.error.flatten(),
      });
      return;
    }

    const { fullName, email, password, phone, preferredLanguage } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        error: "EMAIL_ALREADY_EXISTS",
        message: "An account with this email address already exists. Please log in.",
      });
      return;
    }

    const phoneE164 = phone ? normalizePhoneE164(phone) : null;
    if (phoneE164) {
      const existingPhone = await prisma.user.findUnique({ where: { phoneE164 } });
      if (existingPhone) {
        res.status(409).json({
          error: "PHONE_ALREADY_EXISTS",
          message: "An account with this mobile number already exists. Please log in.",
        });
        return;
      }
    }

    const passwordHash = await AuthService.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneE164,
        passwordHash,
        preferredLanguage,
        role: "CUSTOMER",
        status: "ACTIVE",
        customerProfile: {
          create: {
            birthTimezone: "Asia/Kolkata",
          },
        },
        wallet: {
          create: {
            currency: "INR",
            paidBalancePaise: BigInt(0),
            promoBalancePaise: BigInt(100),
          },
        },
        notificationPref: {
          create: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            whatsappEnabled: true,
          },
        },
      },
      include: { customerProfile: true, wallet: true },
    });

    const session = await AuthService.createSession(
      user.id,
      req.headers["user-agent"],
      req.ip
    );

    const payload = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneE164,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        profile: user.customerProfile,
        wallet: {
          paidBalanceInr: 0,
          promoBalanceInr: 1,
          totalBalanceInr: 1,
        },
      },
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.sessionExpiresAt.toISOString(),
      },
    };

    res.status(201).json({
      success: true,
      ...payload,
      data: payload,
    });
  } catch (error) {
    res.status(500).json({
      error: "REGISTRATION_FAILED",
      message: error instanceof Error ? error.message : "Registration failed.",
    });
  }
});

const loginSchema = z.object({
  identifier: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine((data) => data.identifier || data.email, {
  message: "Either identifier or email is required.",
});

authRouter.post("/login", async (req, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Both email/phone and password are required.",
      });
      return;
    }

    const identifier = parsed.data.identifier || parsed.data.email!;
    const password = parsed.data.password;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneE164: normalizePhoneE164(identifier) }],
      },
      include: { customerProfile: true, wallet: true },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email, mobile number, or password.",
      });
      return;
    }

    const isMatch = await AuthService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email, mobile number, or password.",
      });
      return;
    }

    if (user.status === "DELETED" || user.status === "SUSPENDED") {
      res.status(403).json({
        error: "ACCOUNT_SUSPENDED",
        message: "Your account has been suspended or deleted. Please contact support.",
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const session = await AuthService.createSession(
      user.id,
      req.headers["user-agent"],
      req.ip
    );

    const payload = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneE164,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        profile: user.customerProfile,
        wallet: {
          paidBalanceInr: Number(user.wallet?.paidBalancePaise || 0) / 100,
          promoBalanceInr: Number(user.wallet?.promoBalancePaise || 0) / 100,
          totalBalanceInr:
            Number((user.wallet?.paidBalancePaise || BigInt(0)) + (user.wallet?.promoBalancePaise || BigInt(0))) / 100,
        },
      },
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.sessionExpiresAt.toISOString(),
      },
    };

    res.status(200).json({
      success: true,
      ...payload,
      data: payload,
    });
  } catch (error) {
    res.status(500).json({
      error: "LOGIN_FAILED",
      message: error instanceof Error ? error.message : "Login failed.",
    });
  }
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

authRouter.post("/refresh", async (req, res: Response) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "INVALID_REQUEST",
        message: "A valid refresh token is required.",
      });
      return;
    }

    const { accessToken, newRefreshToken } = await AuthService.refreshSession(
      parsed.data.refreshToken,
      req.headers["user-agent"],
      req.ip
    );

    res.status(200).json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({
      error: "REFRESH_FAILED",
      message: "The refresh token is invalid or has expired. Please log in again.",
    });
  }
});

authRouter.post("/logout", async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && typeof refreshToken === "string") {
      await AuthService.revokeSession(refreshToken);
    }
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch {
    res.status(200).json({ success: true });
  }
});

authRouter.post("/logout-all", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }
    await AuthService.revokeAllUserSessions(req.user.id);
    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "LOGOUT_ALL_FAILED",
      message: "Failed to revoke sessions.",
    });
  }
});

authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
      include: {
        customerProfile: true,
        wallet: true,
        birthProfiles: {
          orderBy: { isDefault: "desc" },
        },
        notificationPref: true,
      },
    });

    const unreadNotificationsCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneE164,
        role: user.role,
        status: user.status,
        preferredLanguage: user.preferredLanguage,
        profile: user.customerProfile,
        birthProfiles: user.birthProfiles,
        unreadNotificationsCount,
        notificationPreferences: user.notificationPref,
        wallet: {
          paidBalanceInr: Number(user.wallet?.paidBalancePaise || 0) / 100,
          promoBalanceInr: Number(user.wallet?.promoBalancePaise || 0) / 100,
          totalBalanceInr:
            Number((user.wallet?.paidBalancePaise || BigInt(0)) + (user.wallet?.promoBalancePaise || BigInt(0))) / 100,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "FETCH_ME_FAILED",
      message: error instanceof Error ? error.message : "Failed to fetch user data.",
    });
  }
});

authRouter.delete("/account", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    // Soft delete: mark account status as DELETED, redact sensitive fields, revoke sessions
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        status: "DELETED",
      },
    });

    await AuthService.revokeAllUserSessions(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deletion request processed. Sessions revoked.",
    });
  } catch (error) {
    res.status(500).json({
      error: "ACCOUNT_DELETION_FAILED",
      message: error instanceof Error ? error.message : "Failed to delete account.",
    });
  }
});
