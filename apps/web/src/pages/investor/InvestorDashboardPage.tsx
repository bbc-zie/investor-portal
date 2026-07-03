import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatCard } from "../../components/ui/StatCard";

export const InvestorDashboardPage = () => (
  <>
    <PageHeader title="Investor Dashboard" description="Placeholder for the future investor experience." />
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <StatCard label="Opportunities" value="--" />
      <StatCard label="Investments" value="--" />
      <StatCard label="Documents" value="--" />
    </div>
    <EmptyState title="Investor dashboard placeholder" description="Business modules will be implemented later." />
  </>
);

