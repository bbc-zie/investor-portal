import {
  PROJECT_STATUSES,
  type ProjectListQuery,
  type ProjectMutationRequest,
  type ProjectSort,
  type ProjectStatus,
  type ProjectVisibility
} from "@bbc-investor-portal/shared";

const PROJECT_VISIBILITIES = ["PRIVATE", "INVESTORS", "PUBLIC"] as const satisfies readonly ProjectVisibility[];
const PROJECT_SORTS = ["newest", "oldest", "targetRaise", "alphabetical"] as const satisfies readonly ProjectSort[];

type ValidationResult<T> = { ok: true; value: T } | { ok: false; status: number; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

const readString = (body: Record<string, unknown>, key: string) => {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
};

const readOptionalString = (body: Record<string, unknown>, key: string) => {
  const value = body[key];
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
};

const isValidCurrency = (value: string) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0;

const isValidDate = (value: string | null) => {
  if (!value) return true;
  return !Number.isNaN(Date.parse(value));
};

export const validateProjectMutation = (body: unknown): ValidationResult<ProjectMutationRequest> => {
  if (!isRecord(body)) {
    return { ok: false, status: 400, message: "Request body must be an object." };
  }

  const name = readString(body, "name");
  const slug = readString(body, "slug");
  const status = readString(body, "status") as ProjectStatus;
  const investmentType = readString(body, "investmentType");
  const location = readString(body, "location");
  const summary = readOptionalString(body, "summary");
  const description = readOptionalString(body, "description");
  const minimumInvestment = readString(body, "minimumInvestment");
  const targetRaise = readString(body, "targetRaise");
  const expectedReturn = readString(body, "expectedReturn");
  const investmentTerm = readString(body, "investmentTerm");
  const openingDate = readOptionalString(body, "openingDate");
  const closingDate = readOptionalString(body, "closingDate");
  const heroImageUrl = readOptionalString(body, "heroImageUrl");
  const coverImageUrl = readOptionalString(body, "coverImageUrl");
  const visibility = readString(body, "visibility") as ProjectVisibility;

  if (!name || !slug || !status || !investmentType || !location || !minimumInvestment || !targetRaise || !expectedReturn || !investmentTerm || !visibility) {
    return { ok: false, status: 400, message: "Required project fields are missing." };
  }

  if (!PROJECT_STATUSES.includes(status)) {
    return { ok: false, status: 400, message: "Project status is invalid." };
  }

  if (!PROJECT_VISIBILITIES.includes(visibility)) {
    return { ok: false, status: 400, message: "Project visibility is invalid." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, status: 400, message: "Slug must use lowercase letters, numbers, and hyphens." };
  }

  if (!isValidCurrency(minimumInvestment) || !isValidCurrency(targetRaise)) {
    return { ok: false, status: 400, message: "Currency fields must be positive numbers with up to two decimals." };
  }

  if (!isValidDate(openingDate ?? null) || !isValidDate(closingDate ?? null)) {
    return { ok: false, status: 400, message: "Dates must be valid ISO date values." };
  }

  if (openingDate && closingDate && new Date(openingDate) > new Date(closingDate)) {
    return { ok: false, status: 400, message: "Opening date cannot be after closing date." };
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      status,
      investmentType,
      location,
      summary,
      description,
      minimumInvestment,
      targetRaise,
      expectedReturn,
      investmentTerm,
      openingDate,
      closingDate,
      heroImageUrl,
      coverImageUrl,
      visibility
    }
  };
};

const readQueryString = (value: unknown) => (typeof value === "string" ? value.trim() : undefined);

export const parseProjectListQuery = (query: Record<string, unknown>): ProjectListQuery => {
  const status = readQueryString(query.status) as ProjectStatus | undefined;
  const sort = readQueryString(query.sort) as ProjectSort | undefined;
  const page = Number(readQueryString(query.page) ?? 1);
  const pageSize = Number(readQueryString(query.pageSize) ?? 10);

  return {
    status: status && PROJECT_STATUSES.includes(status) ? status : "",
    location: readQueryString(query.location) ?? "",
    investmentType: readQueryString(query.investmentType) ?? "",
    search: readQueryString(query.search) ?? "",
    sort: sort && PROJECT_SORTS.includes(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10
  };
};
