import { Outlet } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { InvestorProtectedRoute } from "../auth/ProtectedRoute";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const navItems = [{ label: "Dashboard", to: WEB_ROUTES.investorDashboard, icon: LayoutDashboard }];

export const InvestorLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <InvestorProtectedRoute>
      <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 lg:block">
          <Sidebar title="Investor" items={navItems} />
        </aside>
        {open ? (
          <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="h-full w-72" onClick={(event) => event.stopPropagation()}>
              <Sidebar title="Investor" items={navItems} onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        ) : null}
        <div className="min-w-0">
          <Topbar title="Investor Portal" onMenuClick={() => setOpen(true)} />
          <main className="p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </InvestorProtectedRoute>
  );
};
