import { PageHeader } from "../../components/layout/PageHeader";
import { ProjectForm } from "../../components/projects/ProjectForm";

export const ProjectCreatePage = () => (
  <>
    <PageHeader title="Create Project" description="Add a new investment project record." />
    <ProjectForm />
  </>
);
