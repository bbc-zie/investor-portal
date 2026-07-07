import { Link } from "@tanstack/react-router";
import type { Project } from "@bbc-investor-portal/shared";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Table, TableBody, TableHead } from "../ui/Table";
import { formatCurrency, formatDate } from "./project-utils";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

type ProjectTableProps = {
  projects: Project[];
  canManage: boolean;
  onDelete?: (project: Project) => void;
};

export const ProjectTable = ({ projects, canManage, onDelete }: ProjectTableProps) => (
  <Table>
    <TableHead>
      <tr>
        <th className="px-4 py-3">Project</th>
        <th className="px-4 py-3">Status</th>
        <th className="px-4 py-3">Location</th>
        <th className="px-4 py-3">Target Raise</th>
        <th className="px-4 py-3">Raised</th>
        <th className="px-4 py-3">Minimum Investment</th>
        <th className="px-4 py-3">Opening Date</th>
        <th className="px-4 py-3">Closing Date</th>
        <th className="px-4 py-3">Actions</th>
      </tr>
    </TableHead>
    <TableBody>
      {projects.map((project) => (
        <tr key={project.id} className="bg-white">
          <td className="px-4 py-3">
            <Link
              to={canManage ? WEB_ROUTES.adminProjectDetail : WEB_ROUTES.investorProjectDetail}
              params={{ projectId: project.id }}
              className="font-medium text-slate-950 hover:text-slate-700"
            >
              {project.name}
            </Link>
            <p className="mt-1 text-xs text-slate-500">{project.investmentType}</p>
          </td>
          <td className="px-4 py-3">
            <ProjectStatusBadge status={project.status} />
          </td>
          <td className="px-4 py-3 text-slate-600">{project.location}</td>
          <td className="px-4 py-3 text-slate-600">{formatCurrency(project.targetRaise)}</td>
          <td className="px-4 py-3 text-slate-600">{formatCurrency(project.raisedAmount)}</td>
          <td className="px-4 py-3 text-slate-600">{formatCurrency(project.minimumInvestment)}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(project.openingDate)}</td>
          <td className="px-4 py-3 text-slate-600">{formatDate(project.closingDate)}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Link
                to={canManage ? WEB_ROUTES.adminProjectDetail : WEB_ROUTES.investorProjectDetail}
                params={{ projectId: project.id }}
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                View
              </Link>
              {canManage ? (
                <>
                  <Link
                    to={WEB_ROUTES.adminProjectEdit}
                    params={{ projectId: project.id }}
                    title="Edit project"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button variant="ghost" title="Delete project" className="h-9 w-9 px-0" onClick={() => onDelete?.(project)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
          </td>
        </tr>
      ))}
    </TableBody>
  </Table>
);
