import type { AccountStatus, InvestorTier, UserRole } from "./platform.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: InvestorTier;
  status: AccountStatus;
};
