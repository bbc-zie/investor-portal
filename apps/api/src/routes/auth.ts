import bcrypt from "bcrypt";
import { Router } from "express";
import type { LoginResponse, RefreshTokenResponse } from "@bbc-investor-portal/shared";
import { AUTH_ERROR_MESSAGES, DEFAULT_ACCOUNT_STATUS } from "@bbc-investor-portal/shared";
import {
  createAuthUser,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken,
  isRefreshTokenExpired,
  signAccessToken
} from "../lib/auth.js";
import { authAuditLogger } from "../lib/authAudit.js";
import { clearFailedLogins, isLoginRateLimited, recordFailedLogin } from "../lib/authRateLimit.js";
import { validateLoginRequest, validateRefreshTokenRequest } from "../lib/authValidation.js";
import { prisma } from "../lib/prisma.js";
import { requireAuthenticated } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const validation = validateLoginRequest(req.body);

    if (!validation.ok) {
      res.status(validation.status).json({ error: "Bad Request", message: validation.message });
      return;
    }

    const { email, password } = validation.value;
    const ipAddress = req.ip;
    const userAgent = req.header("user-agent");

    if (isLoginRateLimited(email, ipAddress)) {
      res.status(429).json({ error: "Too Many Requests", message: AUTH_ERROR_MESSAGES.tooManyLoginAttempts });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user?.passwordHash) {
      recordFailedLogin(email, ipAddress);
      await authAuditLogger.record({ type: "LOGIN_FAILED", email, ipAddress, userAgent });
      res.status(401).json({ error: "Unauthorized", message: AUTH_ERROR_MESSAGES.invalidCredentials });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      recordFailedLogin(email, ipAddress);
      await authAuditLogger.record({ type: "LOGIN_FAILED", userId: user.id, email, ipAddress, userAgent });
      res.status(401).json({ error: "Unauthorized", message: AUTH_ERROR_MESSAGES.invalidCredentials });
      return;
    }

    if (user.status !== DEFAULT_ACCOUNT_STATUS) {
      recordFailedLogin(email, ipAddress);
      await authAuditLogger.record({ type: "LOGIN_FAILED", userId: user.id, email, ipAddress, userAgent });
      res.status(401).json({ error: "Unauthorized", message: AUTH_ERROR_MESSAGES.invalidCredentials });
      return;
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = createRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: getRefreshTokenExpiresAt()
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    ]);

    const response: LoginResponse = {
      user: createAuthUser(user),
      accessToken,
      refreshToken
    };

    clearFailedLogins(email, ipAddress);
    await authAuditLogger.record({ type: "LOGIN_SUCCESS", userId: user.id, email, ipAddress, userAgent });
    res.json(response);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", requireAuthenticated, async (req, res, next) => {
  try {
    const validation = validateRefreshTokenRequest(req.body);

    if (!validation.ok) {
      res.status(validation.status).json({ error: "Bad Request", message: validation.message });
      return;
    }

    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user!.id,
        tokenHash: hashToken(validation.value.refreshToken),
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    await authAuditLogger.record({
      type: "LOGOUT",
      userId: req.user!.id,
      ipAddress: req.ip,
      userAgent: req.header("user-agent")
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const validation = validateRefreshTokenRequest(req.body);

    if (!validation.ok) {
      res.status(validation.status).json({ error: "Bad Request", message: validation.message });
      return;
    }

    const tokenHash = hashToken(validation.value.refreshToken);
    const storedRefreshToken = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true }
    });

    if (
      !storedRefreshToken ||
      storedRefreshToken.revokedAt ||
      isRefreshTokenExpired(storedRefreshToken.expiresAt) ||
      storedRefreshToken.user.status !== DEFAULT_ACCOUNT_STATUS
    ) {
      res.status(401).json({ error: "Unauthorized", message: AUTH_ERROR_MESSAGES.invalidRefreshToken });
      return;
    }

    const accessToken = signAccessToken(storedRefreshToken.userId);
    const refreshToken = createRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedRefreshToken.id },
        data: { revokedAt: new Date() }
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedRefreshToken.userId,
          tokenHash: hashToken(refreshToken),
          expiresAt: getRefreshTokenExpiresAt()
        }
      })
    ]);

    await authAuditLogger.record({
      type: "TOKEN_REFRESH",
      userId: storedRefreshToken.userId,
      email: storedRefreshToken.user.email,
      ipAddress: req.ip,
      userAgent: req.header("user-agent")
    });

    const response: RefreshTokenResponse = { accessToken, refreshToken };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
