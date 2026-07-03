import { Menu, UserCircle } from "lucide-react";
import { Button } from "../ui/Button";

type TopbarProps = {
  title?: string;
  onMenuClick?: () => void;
};

export const Topbar = ({ title = "Investor Portal", onMenuClick }: TopbarProps) => (
  <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
    <div className="flex items-center gap-3">
      <Button className="h-9 w-9 px-0 lg:hidden" variant="ghost" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <span className="text-sm font-semibold text-slate-950">{title}</span>
    </div>
    <Button variant="ghost" className="gap-2">
      <UserCircle className="h-5 w-5" />
      <span className="hidden sm:inline">User menu</span>
    </Button>
  </header>
);

