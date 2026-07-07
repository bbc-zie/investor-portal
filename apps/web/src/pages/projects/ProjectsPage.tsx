import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Project, ProjectListQuery } from "@bbc-investor-portal/shared";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { Plus } from "lucide-react";
import { deleteProject, getProjectApiErrorMessage, listProjects } from "../../api/projects";
import { PageHeader } from "../../components/layout/PageHeader";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { ProjectFilters } from "../../components/projects/ProjectFilters";
import { ProjectTable } from "../../components/projects/ProjectTable";

type ProjectsPageProps = {
  canManage: boolean;
};

export const ProjectsPage = ({ canManage }: ProjectsPageProps) => {
  const [query, setQuery] = useState<ProjectListQuery>({ page: 1, pageSize: 10, sort: "newest" });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["projects", query],
    queryFn: () => listProjects(query)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      setDeleteError(null);
      return queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (mutationError) => setDeleteError(getProjectApiErrorMessage(mutationError, "Project could not be deleted."))
  });

  const confirmDelete = (project: Project) => {
    if (window.confirm(`Delete ${project.name}? This will archive it from active project lists.`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const data = projectsQuery.data;
  const detailRoute = canManage ? WEB_ROUTES.adminProjectDetail : WEB_ROUTES.investorProjectDetail;

  return (
    <>
      <PageHeader title="Projects" description={canManage ? "Manage investment project records and visibility." : "View available investment projects."}>
        {canManage ? (
          <Link
            to={WEB_ROUTES.adminProjectCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        ) : null}
      </PageHeader>

      <div className="space-y-4">
        <ProjectFilters
          value={query}
          locations={data?.filters.locations ?? []}
          investmentTypes={data?.filters.investmentTypes ?? []}
          onChange={setQuery}
        />

        {projectsQuery.isLoading ? <LoadingState label="Loading projects" /> : null}
        {projectsQuery.isError ? <ErrorState title="Projects could not be loaded" message="Refresh the page or try again later." /> : null}
        {deleteError ? <ErrorState title="Project could not be deleted" message={deleteError} /> : null}

        {data && data.projects.length === 0 ? (
          <EmptyState title="No projects found" description="Projects will appear here after they are created." />
        ) : null}

        {data && data.projects.length > 0 ? (
          <>
            {canManage ? (
              <ProjectTable projects={data.projects} canManage={canManage} onDelete={confirmDelete} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} detailRoute={detailRoute} />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={data.pagination.page <= 1}
                  onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => setQuery((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};
