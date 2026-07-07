import {
  API_ENDPOINTS,
  type AccountStatus,
  type GetUserResponse,
  type GetUsersResponse,
  type InvestorTier,
  type KycStatus,
  type NdaStatus,
  type UpdateUserResponse,
  type UserRole
} from "@bbc-investor-portal/shared";
import { apiClient } from "./client";

export type GetUsersParams = {
  search?: string;
  role?: UserRole | "";
  tier?: InvestorTier | "";
  status?: AccountStatus | "";
  kycStatus?: KycStatus | "";
  ndaStatus?: NdaStatus | "";
  page?: number;
  pageSize?: number;
};

const withoutEmptyValues = (params: GetUsersParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  );

export const getUsers = async (params: GetUsersParams) => {
  const response = await apiClient.get<GetUsersResponse>(API_ENDPOINTS.users, {
    params: withoutEmptyValues(params)
  });

  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await apiClient.get<GetUserResponse>(API_ENDPOINTS.user(userId));
  return response.data;
};

export const updateUserStatus = async (userId: string, status: AccountStatus) => {
  const response = await apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.userStatus(userId), { status });
  return response.data;
};

export const updateUserRoleTier = async (userId: string, role: UserRole, tier: InvestorTier) => {
  const response = await apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.userRoleTier(userId), { role, tier });
  return response.data;
};

export const updateUserKyc = async (userId: string, kycStatus: KycStatus) => {
  const response = await apiClient.patch<UpdateUserResponse>(API_ENDPOINTS.userKyc(userId), { kycStatus });
  return response.data;
};
