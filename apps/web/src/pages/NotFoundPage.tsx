import { Link } from "@tanstack/react-router";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";

export const NotFoundPage = () => (
  <>
    <PageHeader title="Not Found" />
    <EmptyState title="Page not found" description="The requested route does not exist.">
      <Link to="/" className="text-sm font-medium text-slate-950 underline">
        Go home
      </Link>
    </EmptyState>
  </>
);

