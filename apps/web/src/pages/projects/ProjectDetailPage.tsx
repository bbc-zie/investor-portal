import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProject, getProject, getProjectApiErrorMessage } from "../../api/projects";
import { PageHeader } from "../../components/layout/PageHeader";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatCurrency, formatDate } from "../../components/projects/project-utils";
import { ProjectStatusBadge } from "../../components/projects/ProjectStatusBadge";

type ProjectDetailPageProps = {
  canManage: boolean;
};

export const ProjectDetailPage = ({ canManage }: ProjectDetailPageProps) => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await navigate({ to: WEB_ROUTES.adminProjects });
    },
    onError: () => undefined
  });

  const project = projectQuery.data;

  if (projectQuery.isLoading) return <LoadingState label="Loading project" />;
  if (projectQuery.isError || !project) return <ErrorState title="Project could not be loaded" message="The project may not exist or may have been archived." />;

  return (
    <>
      <PageHeader title={project.name} description={project.summary ?? undefined}>
        {canManage ? (
          <>
            <Link
              to={WEB_ROUTES.adminProjectEdit}
              params={{ projectId: project.id }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <Button
              variant="secondary"
              className="gap-2"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm(`Delete ${project.name}? This is a soft delete.`)) deleteMutation.mutate(project.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        ) : null}
      </PageHeader>

      <div className="space-y-4">
        {deleteMutation.isError ? (
          <ErrorState title="Project could not be deleted" message={getProjectApiErrorMessage(deleteMutation.error, "Project could not be deleted.")} />
        ) : null}

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="text-sm text-slate-500">{project.visibility}</span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Location" value={project.location} />
            <Detail label="Investment Type" value={project.investmentType} />
            <Detail label="Target Raise" value={formatCurrency(project.targetRaise)} />
            <Detail label="Raised Amount" value={formatCurrency(project.raisedAmount)} />
            <Detail label="Minimum Investment" value={formatCurrency(project.minimumInvestment)} />
            <Detail label="Expected Return" value={project.expectedReturn} />
            <Detail label="Investment Term" value={project.investmentTerm} />
            <Detail label="Opening Date" value={formatDate(project.openingDate)} />
            <Detail label="Closing Date" value={formatDate(project.closingDate)} />
          </dl>
        </Card>

        <Card>
          <h2 className="mb-2 text-lg font-semibold text-slate-950">Description</h2>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{project.description || "No description provided."}</p>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Project Timeline</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Opening Date" value={formatDate(project.openingDate)} />
            <Detail label="Closing Date" value={formatDate(project.closingDate)} />
          </div>
        </Card>
      </div>
    </>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-slate-950">{value}</dd>
  </div>
);
