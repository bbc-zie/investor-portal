import { Router } from "express";
import type { Response } from "express";
import { Prisma } from "@prisma/client";
import {
  ACCOUNT_STATUSES,
  ADMIN_ROLES,
  INVESTOR_TIERS,
  KYC_STATUSES,
  NDA_STATUSES,
  USER_ROLES,
  type AccountStatus,
  type InvestorTier,
  type KycStatus,
  type NdaStatus,
  type UserManagementDetail,
  type UserManagementListItem,
  type UserRole
} from "@bbc-investor-portal/shared";
import { requireAuthenticated } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../lib/prisma.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const userManagementInclude = {
  investorProfile: {
    include: {
      ndaRecords: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 1
      }
    }
  }
} satisfies Prisma.UserInclude;

type UserWithManagementRelations = Prisma.UserGetPayload<{
  include: typeof userManagementInclude;
}>;

type AuditChange = {
  from: string | null;
  to: string;
};

export const usersRouter = Router();

usersRouter.use(requireAuthenticated, requireRole(...ADMIN_ROLES));

const readQueryString = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
  return undefined;
};

const parsePositiveIntQuery = (value: unknown, fallback: number, max?: number) => {
  const text = readQueryString(value);
  if (!text) return fallback;

  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 1) return null;

  return max ? Math.min(parsed, max) : parsed;
};

const parseEnumQuery = <T extends readonly string[]>(value: unknown, allowed: T) => {
  const text = readQueryString(value);
  if (!text) return undefined;

  return allowed.includes(text as T[number]) ? (text as T[number]) : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseEnumBodyValue = <T extends readonly string[]>(value: unknown, allowed: T) =>
  typeof value === "string" && allowed.includes(value as T[number]) ? (value as T[number]) : null;

const latestNdaRecord = (user: UserWithManagementRelations) => user.investorProfile?.ndaRecords[0] ?? null;
const currentNdaStatus = (user: UserWithManagementRelations): NdaStatus => latestNdaRecord(user)?.status ?? "NOT_REQUIRED";

const serializeUserListItem = (user: UserWithManagementRelations): UserManagementListItem => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    status: user.status,
    kycStatus: user.investorProfile?.kycStatus ?? "NOT_STARTED",
    ndaStatus: currentNdaStatus(user),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
};

const serializeUserDetail = (user: UserWithManagementRelations): UserManagementDetail => {
  const ndaRecord = latestNdaRecord(user);

  return {
    ...serializeUserListItem(user),
    investorProfile: user.investorProfile
      ? {
          id: user.investorProfile.id,
          legalName: user.investorProfile.legalName,
          phone: user.investorProfile.phone,
          company: user.investorProfile.company,
          kycStatus: user.investorProfile.kycStatus,
          createdAt: user.investorProfile.createdAt.toISOString(),
          updatedAt: user.investorProfile.updatedAt.toISOString()
        }
      : null,
    ndaRecord: ndaRecord
      ? {
          id: ndaRecord.id,
          status: ndaRecord.status,
          signedAt: ndaRecord.signedAt?.toISOString() ?? null,
          expiresAt: ndaRecord.expiresAt?.toISOString() ?? null,
          createdAt: ndaRecord.createdAt.toISOString(),
          updatedAt: ndaRecord.updatedAt.toISOString()
        }
      : null
  };
};

const sendBadRequest = (res: Response, message: string) => {
  res.status(400).json({ error: "Bad Request", message });
};

const sendForbidden = (res: Response, message: string) => {
  res.status(403).json({ error: "Forbidden", message });
};

const canManageTargetRole = (res: Response, actorRole: UserRole | undefined, targetRole: UserRole) => {
  if (actorRole !== "SUPER_ADMIN" && targetRole === "SUPER_ADMIN") {
    sendForbidden(res, "Only super admins can modify super admin users");
    return false;
  }

  return true;
};

const canAssignRole = (res: Response, actorRole: UserRole | undefined, nextRole: UserRole | undefined) => {
  if (actorRole !== "SUPER_ADMIN" && nextRole === "SUPER_ADMIN") {
    sendForbidden(res, "Only super admins can grant super admin access");
    return false;
  }

  return true;
};

const writeAuditLog = async (
  targetUserId: string,
  actorUserId: string | undefined,
  event: "USER_STATUS_UPDATED" | "USER_ROLE_TIER_UPDATED" | "USER_KYC_UPDATED",
  changes: Record<string, AuditChange>
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: targetUserId,
        action: "UPDATE",
        entity: "User",
        entityId: targetUserId,
        metadata: {
          event,
          actorUserId: actorUserId ?? null,
          changes
        }
      }
    });
  } catch (error) {
    console.warn("Failed to write user management audit log", error);
  }
};

const isPrismaNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

usersRouter.get("/", async (req, res, next) => {
  try {
    const page = parsePositiveIntQuery(req.query.page, DEFAULT_PAGE);
    const pageSize = parsePositiveIntQuery(req.query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    if (!page || !pageSize) {
      sendBadRequest(res, "page and pageSize must be positive integers");
      return;
    }

    const role = parseEnumQuery(req.query.role, USER_ROLES) as UserRole | undefined | null;
    const tier = parseEnumQuery(req.query.tier, INVESTOR_TIERS) as InvestorTier | undefined | null;
    const status = parseEnumQuery(req.query.status, ACCOUNT_STATUSES) as AccountStatus | undefined | null;
    const kycStatus = parseEnumQuery(req.query.kycStatus, KYC_STATUSES) as KycStatus | undefined | null;
    const ndaStatus = parseEnumQuery(req.query.ndaStatus, NDA_STATUSES) as NdaStatus | undefined | null;

    if (role === null || tier === null || status === null || kycStatus === null || ndaStatus === null) {
      sendBadRequest(res, "One or more filters contain unsupported values");
      return;
    }

    const filters: Prisma.UserWhereInput[] = [];
    const search = readQueryString(req.query.search);

    if (search) {
      filters.push({
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          { investorProfile: { is: { legalName: { contains: search, mode: "insensitive" } } } },
          { investorProfile: { is: { company: { contains: search, mode: "insensitive" } } } },
          { investorProfile: { is: { phone: { contains: search, mode: "insensitive" } } } }
        ]
      });
    }

    if (role) filters.push({ role });
    if (tier) filters.push({ tier });
    if (status) filters.push({ status });

    if (kycStatus) {
      filters.push(
        kycStatus === "NOT_STARTED"
          ? { OR: [{ investorProfile: null }, { investorProfile: { is: { kycStatus } } }] }
          : { investorProfile: { is: { kycStatus } } }
      );
    }

    const where: Prisma.UserWhereInput = filters.length ? { AND: filters } : {};
    const skip = (page - 1) * pageSize;

    if (ndaStatus) {
      const filteredUsers = (
        await prisma.user.findMany({
          where,
          include: userManagementInclude,
          orderBy: { createdAt: "desc" }
        })
      ).filter((user) => currentNdaStatus(user) === ndaStatus);

      const users = filteredUsers.slice(skip, skip + pageSize);

      res.json({
        users: users.map(serializeUserListItem),
        pagination: {
          page,
          pageSize,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / pageSize)
        }
      });
      return;
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: userManagementInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize
      })
    ]);

    res.json({
      users: users.map(serializeUserListItem),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: userManagementInclude
    });

    if (!user) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    res.json({ user: serializeUserDetail(user) });
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/:id/status", async (req, res, next) => {
  try {
    if (!isRecord(req.body)) {
      sendBadRequest(res, "Request body must be a JSON object");
      return;
    }

    const status = parseEnumBodyValue(req.body.status, ACCOUNT_STATUSES) as AccountStatus | null;
    if (!status) {
      sendBadRequest(res, "status must be ACTIVE, SUSPENDED, or DEACTIVATED");
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { role: true, status: true }
    });

    if (!existing) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    if (!canManageTargetRole(res, req.user?.role, existing.role)) return;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      include: userManagementInclude
    });

    await writeAuditLog(req.params.id, req.user?.id, "USER_STATUS_UPDATED", {
      status: { from: existing.status, to: status }
    });

    res.json({ user: serializeUserDetail(updated) });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    next(error);
  }
});

usersRouter.patch("/:id/role-tier", async (req, res, next) => {
  try {
    if (!isRecord(req.body)) {
      sendBadRequest(res, "Request body must be a JSON object");
      return;
    }

    const role =
      req.body.role === undefined
        ? undefined
        : (parseEnumBodyValue(req.body.role, USER_ROLES) as UserRole | null);
    const tier =
      req.body.tier === undefined
        ? undefined
        : (parseEnumBodyValue(req.body.tier, INVESTOR_TIERS) as InvestorTier | null);

    if (role === null) {
      sendBadRequest(res, "role must be INVESTOR, ADMIN, or SUPER_ADMIN");
      return;
    }

    if (tier === null) {
      sendBadRequest(res, "tier must be PUBLIC, APPROVED_INVESTOR, or ACTIVE_INVESTOR");
      return;
    }

    if (!role && !tier) {
      sendBadRequest(res, "At least one of role or tier is required");
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { role: true, tier: true }
    });

    if (!existing) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    if (!canManageTargetRole(res, req.user?.role, existing.role)) return;
    if (!canAssignRole(res, req.user?.role, role)) return;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(role ? { role } : {}),
        ...(tier ? { tier } : {})
      },
      include: userManagementInclude
    });

    const changes: Record<string, AuditChange> = {};
    if (role) changes.role = { from: existing.role, to: role };
    if (tier) changes.tier = { from: existing.tier, to: tier };

    await writeAuditLog(req.params.id, req.user?.id, "USER_ROLE_TIER_UPDATED", changes);

    res.json({ user: serializeUserDetail(updated) });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    next(error);
  }
});

usersRouter.patch("/:id/kyc", async (req, res, next) => {
  try {
    if (!isRecord(req.body)) {
      sendBadRequest(res, "Request body must be a JSON object");
      return;
    }

    const kycStatus = parseEnumBodyValue(req.body.kycStatus, KYC_STATUSES) as KycStatus | null;
    if (!kycStatus) {
      sendBadRequest(res, "kycStatus must be NOT_STARTED, PENDING, APPROVED, or REJECTED");
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { investorProfile: true }
    });

    if (!existing) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    if (!canManageTargetRole(res, req.user?.role, existing.role)) return;

    await prisma.investorProfile.upsert({
      where: { userId: req.params.id },
      update: { kycStatus },
      create: {
        userId: req.params.id,
        kycStatus
      }
    });

    const updated = await prisma.user.findUniqueOrThrow({
      where: { id: req.params.id },
      include: userManagementInclude
    });

    await writeAuditLog(req.params.id, req.user?.id, "USER_KYC_UPDATED", {
      kycStatus: { from: existing.investorProfile?.kycStatus ?? "NOT_STARTED", to: kycStatus }
    });

    res.json({ user: serializeUserDetail(updated) });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ error: "Not Found", message: "User not found" });
      return;
    }

    next(error);
  }
});
