import type { AuthenticatedUser } from "./auth.js";
import type {
  AccountStatus,
  InvestorTier,
  KycStatus,
  NdaStatus,
  UserRole
} from "./platform.js";

export type ApiErrorResponse = {
  error: string;
  message?: string;
};

export type HealthResponse = {
  status: "ok";
  service: string;
  timestamp: string;
};

export type TestDbResponse = {
  status: string;
  database: string;
  now: string | null;
};

export type MeResponse = {
  user: AuthenticatedUser;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UserManagementListItem = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  tier: InvestorTier;
  status: AccountStatus;
  kycStatus: KycStatus;
  ndaStatus: NdaStatus;
  createdAt: string;
  updatedAt: string;
};

export type InvestorProfileSummary = {
  id: string;
  legalName?: string | null;
  phone?: string | null;
  company?: string | null;
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
};

export type NdaRecordSummary = {
  id: string;
  status: NdaStatus;
  signedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserManagementDetail = UserManagementListItem & {
  investorProfile: InvestorProfileSummary | null;
  ndaRecord: NdaRecordSummary | null;
};

export type GetUsersResponse = {
  users: UserManagementListItem[];
  pagination: PaginationMeta;
};

export type GetUserResponse = {
  user: UserManagementDetail;
};

export type UpdateUserStatusRequest = {
  status: AccountStatus;
};

export type UpdateUserRoleTierRequest = {
  role?: UserRole;
  tier?: InvestorTier;
};

export type UpdateUserKycRequest = {
  kycStatus: KycStatus;
};

export type UpdateUserResponse = {
  user: UserManagementDetail;
};
