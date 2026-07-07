import type {
  AuditAction,
  CapitalCallStatus,
  DistributionStatus,
  DocumentAccessLevel,
  InvestmentStatus,
  KycStatus,
  NdaStatus,
  NotificationType,
  OpportunityStatus,
  PaymentStatus,
  ProjectStatus
} from "../types/platform.js";

export const KYC_STATUSES = ["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"] as const satisfies readonly KycStatus[];
export const NDA_STATUSES = ["NOT_REQUIRED", "PENDING", "SIGNED", "EXPIRED"] as const satisfies readonly NdaStatus[];
export const OPPORTUNITY_STATUSES = ["DRAFT", "OPEN", "CLOSED", "ARCHIVED"] as const satisfies readonly OpportunityStatus[];
export const PROJECT_STATUSES = ["DRAFT", "COMING_SOON", "OPEN", "FUNDED", "CLOSED", "ARCHIVED"] as const satisfies readonly ProjectStatus[];
export const INVESTMENT_STATUSES = ["PENDING", "ACTIVE", "EXITED", "CANCELLED"] as const satisfies readonly InvestmentStatus[];
export const CAPITAL_CALL_STATUSES = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"] as const satisfies readonly CapitalCallStatus[];
export const PAYMENT_STATUSES = ["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"] as const satisfies readonly PaymentStatus[];
export const DISTRIBUTION_STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"] as const satisfies readonly DistributionStatus[];
export const DOCUMENT_ACCESS_LEVELS = ["PUBLIC", "INVESTOR", "APPROVED_INVESTOR", "ACTIVE_INVESTOR", "ADMIN"] as const satisfies readonly DocumentAccessLevel[];
export const NOTIFICATION_TYPES = ["SYSTEM", "OPPORTUNITY", "CAPITAL_CALL", "DISTRIBUTION", "DOCUMENT"] as const satisfies readonly NotificationType[];
export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW", "DOWNLOAD", "APPROVE", "REJECT"] as const satisfies readonly AuditAction[];
