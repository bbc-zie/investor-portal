import { SidebarNav, type SidebarNavItem } from "./SidebarNav";

type SidebarProps = {
  title: string;
  items: SidebarNavItem[];
  onNavigate?: () => void;
};

export const Sidebar = ({ title, items, onNavigate }: SidebarProps) => (
  <aside className="h-full bg-white p-4">
    <div className="mb-6 text-sm font-semibold text-slate-950">{title}</div>
    <SidebarNav items={items} onNavigate={onNavigate} />
  </aside>
);
