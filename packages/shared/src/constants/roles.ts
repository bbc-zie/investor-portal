import type { AccountStatus, InvestorTier, UserRole } from "../types/platform.js";

export const USER_ROLES = ["INVESTOR", "ADMIN", "SUPER_ADMIN"] as const satisfies readonly UserRole[];
export const INVESTOR_TIERS = ["PUBLIC", "APPROVED_INVESTOR", "ACTIVE_INVESTOR"] as const satisfies readonly InvestorTier[];
export const ACCOUNT_STATUSES = ["ACTIVE", "SUSPENDED", "DEACTIVATED"] as const satisfies readonly AccountStatus[];

export const DEFAULT_USER_ROLE = "INVESTOR" satisfies UserRole;
export const DEFAULT_INVESTOR_TIER = "PUBLIC" satisfies InvestorTier;
export const DEFAULT_ACCOUNT_STATUS = "ACTIVE" satisfies AccountStatus;
