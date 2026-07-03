import type { HTMLAttributes, PropsWithChildren, TableHTMLAttributes } from "react";

export const Table = ({ children, className = "", ...props }: PropsWithChildren<TableHTMLAttributes<HTMLTableElement>>) => (
  <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
    <table className={`min-w-full divide-y divide-slate-200 text-sm ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) => (
  <thead className={`bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) => (
  <tbody className={`divide-y divide-slate-200 ${className}`} {...props}>
    {children}
  </tbody>
);

