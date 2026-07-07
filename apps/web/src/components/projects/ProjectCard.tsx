import { Link } from "@tanstack/react-router";
import type { Project } from "@bbc-investor-portal/shared";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";
import { formatCurrency, formatDate } from "./project-utils";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

type ProjectCardProps = {
  project: Project;
  detailRoute: typeof WEB_ROUTES.adminProjectDetail | typeof WEB_ROUTES.investorProjectDetail;
};

export const ProjectCard = ({ project, detailRoute }: ProjectCardProps) => (
  <Card className="flex h-full flex-col gap-4 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{project.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{project.location}</p>
      </div>
      <ProjectStatusBadge status={project.status} />
    </div>
    <p className="line-clamp-3 text-sm text-slate-600">{project.summary || "No summary provided."}</p>
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-slate-500">Target Raise</dt>
        <dd className="font-medium text-slate-950">{formatCurrency(project.targetRaise)}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Minimum</dt>
        <dd className="font-medium text-slate-950">{formatCurrency(project.minimumInvestment)}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Opening</dt>
        <dd className="font-medium text-slate-950">{formatDate(project.openingDate)}</dd>
      </div>
      <div>
        <dt className="text-slate-500">Closing</dt>
        <dd className="font-medium text-slate-950">{formatDate(project.closingDate)}</dd>
      </div>
    </dl>
    <Link
      to={detailRoute}
      params={{ projectId: project.id }}
      className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-slate-950 hover:text-slate-700"
    >
      View project <ArrowRight className="h-4 w-4" />
    </Link>
  </Card>
);
