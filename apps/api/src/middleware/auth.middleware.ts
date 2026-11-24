import type { NextFunction, Request, Response } from "express";
import { AuthService, type TokenPayload } from "../services/auth.service.js";
import { prisma } from "../db.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    status: string;
    email?: string | null;
    phoneE164?: string | null;
    fullName: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.namh_access_token) {
      token = req.cookies.namh_access_token;
    }

    if (!token) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Authentication token is required to access this resource.",
      });
      return;
    }

    let payload: TokenPayload;
    try {
      payload = AuthService.verifyAccessToken(token);
    } catch {
      res.status(401).json({
        error: "TOKEN_EXPIRED_OR_INVALID",
        message: "Your session has expired. Please refresh your token or login again.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        status: true,
        email: true,
        phoneE164: true,
        fullName: true,
      },
    });

    if (!user || user.status === "DELETED" || user.status === "SUSPENDED") {
      res.status(403).json({
        error: "ACCOUNT_INACTIVE",
        message: "Your account is not active or has been suspended.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      error: "AUTH_INTERNAL_ERROR",
      message: "An internal error occurred during authentication verification.",
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Authentication required.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: "You do not have permission to perform this action.",
      });
      return;
    }

    next();
  };
}
