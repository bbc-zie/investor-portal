import { Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

export type SidebarNavItem = {
  label: string;
  to: string;
  icon?: ComponentType<{ className?: string }>;
};

type SidebarNavProps = {
  items: SidebarNavItem[];
  onNavigate?: () => void;
};

export const SidebarNav = ({ items, onNavigate }: SidebarNavProps) => (
  <nav className="space-y-1">
    {items.map((item) => {
      const Icon = item.icon;

      return (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          activeProps={{ className: "bg-slate-950 text-white hover:bg-slate-950 hover:text-white" }}
        >
          {Icon ? <Icon className="h-4 w-4" /> : null}
          <span>{item.label}</span>
        </Link>
      );
    })}
  </nav>
);

