import { Outlet } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const navItems = [{ label: "Dashboard", to: WEB_ROUTES.adminDashboard, icon: LayoutDashboard }];

export const AdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-slate-200 lg:block">
        <Sidebar title="Admin" items={navItems} />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72" onClick={(event) => event.stopPropagation()}>
            <Sidebar title="Admin" items={navItems} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <Topbar title="Admin Portal" onMenuClick={() => setOpen(true)} />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
