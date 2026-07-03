import { Link } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { Card } from "../components/ui/Card";

export const HomePage = () => (
  <Card>
    <h1 className="text-2xl font-semibold text-slate-950">BBC Investor Portal</h1>
    <p className="mt-2 text-sm text-slate-600">Shared application foundation placeholder.</p>
    <div className="mt-6 flex flex-wrap gap-3 text-sm">
      <Link className="font-medium text-slate-950 underline" to={WEB_ROUTES.investorDashboard}>
        Investor dashboard
      </Link>
      <Link className="font-medium text-slate-950 underline" to={WEB_ROUTES.adminDashboard}>
        Admin dashboard
      </Link>
    </div>
  </Card>
);
