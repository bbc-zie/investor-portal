import type { UserRole } from "../types/platform.js";
import { USER_ROLES } from "./roles.js";

export const AUTHENTICATED_ROLES: readonly UserRole[] = USER_ROLES;
export const ADMIN_ROLES: readonly UserRole[] = ["ADMIN", "SUPER_ADMIN"];
