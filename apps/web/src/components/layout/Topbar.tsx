import { useNavigate } from "@tanstack/react-router";
import { Menu, UserCircle } from "lucide-react";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import { useAuth } from "../../auth/auth-context";
import { Button } from "../ui/Button";

type TopbarProps = {
  title?: string;
  onMenuClick?: () => void;
};

export const Topbar = ({ title = "Investor Portal", onMenuClick }: TopbarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const onLogout = async () => {
    await logout();
    await navigate({ to: WEB_ROUTES.login });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button className="h-9 w-9 px-0 lg:hidden" variant="ghost" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold text-slate-950">{title}</span>
      </div>
      <Button variant="ghost" className="gap-2" onClick={onLogout} title={user?.email ?? "Sign out"}>
        <UserCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </header>
  );
};

