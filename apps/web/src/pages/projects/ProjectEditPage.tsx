import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getProject } from "../../api/projects";
import { PageHeader } from "../../components/layout/PageHeader";
import { ProjectForm } from "../../components/projects/ProjectForm";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";

export const ProjectEditPage = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId)
  });

  if (projectQuery.isLoading) return <LoadingState label="Loading project" />;
  if (projectQuery.isError || !projectQuery.data) return <ErrorState title="Project could not be loaded" />;

  return (
    <>
      <PageHeader title="Edit Project" description={projectQuery.data.name} />
      <ProjectForm project={projectQuery.data} />
    </>
  );
};
