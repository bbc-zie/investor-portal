import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/states/ErrorState";

export const UnauthorizedPage = () => (
  <>
    <PageHeader title="Unauthorized" />
    <ErrorState title="Access denied" message="Your account does not have access to this area." />
  </>
);
