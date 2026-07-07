import type { AuthenticatedUser } from "./auth.js";
import type { Project, ProjectStatus, ProjectVisibility } from "./platform.js";

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

export type ProjectSort = "newest" | "oldest" | "targetRaise" | "alphabetical";

export type ProjectListQuery = {
  status?: ProjectStatus | "";
  location?: string;
  investmentType?: string;
  search?: string;
  sort?: ProjectSort;
  page?: number;
  pageSize?: number;
};

export type ProjectListResponse = {
  projects: Project[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    locations: string[];
    investmentTypes: string[];
  };
};

export type ProjectResponse = {
  project: Project;
};

export type ProjectMutationRequest = {
  name: string;
  slug: string;
  status: ProjectStatus;
  investmentType: string;
  location: string;
  summary?: string | null;
  description?: string | null;
  minimumInvestment: string;
  targetRaise: string;
  expectedReturn: string;
  investmentTerm: string;
  openingDate?: string | null;
  closingDate?: string | null;
  heroImageUrl?: string | null;
  coverImageUrl?: string | null;
  visibility: ProjectVisibility;
};
