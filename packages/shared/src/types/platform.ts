export type UserRole = "INVESTOR" | "ADMIN" | "SUPER_ADMIN";
export type InvestorTier = "PUBLIC" | "APPROVED_INVESTOR" | "ACTIVE_INVESTOR";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type KycStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED";
export type NdaStatus = "NOT_REQUIRED" | "PENDING" | "SIGNED" | "EXPIRED";
export type ProjectStatus = "DRAFT" | "COMING_SOON" | "OPEN" | "FUNDED" | "CLOSED" | "ARCHIVED";
export type ProjectVisibility = "PRIVATE" | "INVESTORS" | "PUBLIC";
export type OpportunityStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
export type InvestmentStatus = "PENDING" | "ACTIVE" | "EXITED" | "CANCELLED";
export type CapitalCallStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
export type DistributionStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
export type DocumentAccessLevel = "PUBLIC" | "INVESTOR" | "APPROVED_INVESTOR" | "ACTIVE_INVESTOR" | "ADMIN";
export type NotificationType = "SYSTEM" | "OPPORTUNITY" | "CAPITAL_CALL" | "DISTRIBUTION" | "DOCUMENT";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "VIEW" | "DOWNLOAD" | "APPROVE" | "REJECT";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  tier: InvestorTier;
  status: AccountStatus;
  kycStatus?: KycStatus;
  ndaStatus?: NdaStatus;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  status: ProjectStatus;
  investmentType: string;
  location: string;
  minimumInvestment: string;
  targetRaise: string;
  raisedAmount: string;
  expectedReturn: string;
  investmentTerm: string;
  openingDate?: string | null;
  closingDate?: string | null;
  heroImageUrl?: string | null;
  coverImageUrl?: string | null;
  visibility: ProjectVisibility;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  projectId: string;
  title: string;
  summary?: string | null;
  status: OpportunityStatus;
  targetAmount?: string | null;
  minimumAmount?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Investment = {
  id: string;
  userId: string;
  projectId: string;
  opportunityId?: string | null;
  amount: string;
  status: InvestmentStatus;
  createdAt: string;
  updatedAt: string;
};

export type CapitalCall = {
  id: string;
  investmentId: string;
  amount: string;
  dueDate?: string | null;
  status: CapitalCallStatus;
  createdAt: string;
  updatedAt: string;
};

export type CapitalCallPayment = {
  id: string;
  capitalCallId: string;
  amount: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Distribution = {
  id: string;
  projectId: string;
  title: string;
  amount: string;
  status: DistributionStatus;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DistributionPayout = {
  id: string;
  distributionId: string;
  investmentId: string;
  amount: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Document = {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  accessLevel: DocumentAccessLevel;
  projectId?: string | null;
  opportunityId?: string | null;
  uploadedById?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: string;
  userId?: string | null;
  projectId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};
