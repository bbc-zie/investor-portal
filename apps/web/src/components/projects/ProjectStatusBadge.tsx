import type { ProjectStatus } from "@bbc-investor-portal/shared";
import { Badge } from "../ui/Badge";
import { projectStatusLabels } from "./project-utils";

const tones: Record<ProjectStatus, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  COMING_SOON: "warning",
  OPEN: "success",
  FUNDED: "success",
  CLOSED: "neutral",
  ARCHIVED: "danger"
};

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => (
  <Badge tone={tones[status]}>{projectStatusLabels[status]}</Badge>
);
