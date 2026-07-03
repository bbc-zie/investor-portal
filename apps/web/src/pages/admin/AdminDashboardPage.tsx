import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";

export const AdminDashboardPage = () => (
  <>
    <PageHeader title="Admin Dashboard" description="Placeholder for the future admin experience." />
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <StatCard label="Users" value="--" />
      <StatCard label="Projects" value="--" />
      <StatCard label="Activity" value="--" />
    </div>
    <EmptyState title="Admin dashboard placeholder" description="Admin CRUD will be implemented later." />
  </>
);

