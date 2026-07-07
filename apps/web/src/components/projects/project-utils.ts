import type { ProjectStatus } from "@bbc-investor-portal/shared";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  COMING_SOON: "Coming Soon",
  OPEN: "Open",
  FUNDED: "Funded",
  CLOSED: "Closed",
  ARCHIVED: "Archived"
};

export const formatCurrency = (value: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const formatDate = (value?: string | null) => (value ? new Intl.DateTimeFormat("en-US").format(new Date(value)) : "--");

export const dateInputValue = (value?: string | null) => (value ? value.slice(0, 10) : "");
