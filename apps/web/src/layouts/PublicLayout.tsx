import { Link, Outlet } from "@tanstack/react-router";
import { WEB_ROUTES } from "@bbc-investor-portal/shared";
import type { PropsWithChildren } from "react";

export const PublicLayout = ({ children }: PropsWithChildren) => (
  <div className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={WEB_ROUTES.home} className="text-sm font-semibold text-slate-950">
          BBC Investor Portal
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link to={WEB_ROUTES.testDb} className="hover:text-slate-950">
            Test DB
          </Link>
          <Link to={WEB_ROUTES.login} className="hover:text-slate-950">
            Login
          </Link>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children ?? <Outlet />}</main>
  </div>
);
