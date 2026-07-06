import { PageHeader } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";

const dashboardModules = [
  {
    title: "Projects",
    description: "Manage project setup, visibility, and operational readiness."
  },
  {
    title: "Investments",
    description: "Review investor commitments and investment workflow status."
  },
  {
    title: "Capital Calls",
    description: "Coordinate upcoming funding requests and contribution tracking."
  },
  {
    title: "Payments",
    description: "Monitor payment operations and reconciliation readiness."
  },
  {
    title: "Distributions",
    description: "Prepare distribution activity and investor payout coordination."
  },
  {
    title: "Reports",
    description: "Access operational reporting and platform performance views."
  },
  {
    title: "Audit Logs",
    description: "Review administrative events and platform activity history."
  }
];

const quickActions = ["Create Project", "Create Opportunity", "Upload Document", "Invite User"];

const platformStatus = [
  { label: "API", status: "Healthy" },
  { label: "Database", status: "Healthy" },
  { label: "Authentication", status: "Healthy" },
  { label: "Storage", status: "Healthy" }
];

export const AdminDashboardPage = () => (
  <div className="space-y-6">
    <PageHeader title="Admin Dashboard" description="Command center for platform operations">
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
        Current user: Admin operator
      </div>
    </PageHeader>

    <section>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-950">Dashboard Modules</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardModules.map((module) => (
          <Card key={module.title} className="flex min-h-40 flex-col justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{module.description}</p>
            </div>
            <Badge tone="neutral">Ready for implementation</Badge>
          </Card>
        ))}
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-950">Quick Actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Button key={action} type="button" variant="secondary" className="w-full">
                {action}
              </Button>
            ))}
          </div>
        </Card>

        <EmptyState title="No recent admin activity yet." />
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-950">Platform Status</h2>
        </div>
        <div className="space-y-3">
          {platformStatus.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <Badge tone="success">{item.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </section>
  </div>
);

