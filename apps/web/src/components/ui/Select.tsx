import type { SelectHTMLAttributes } from "react";

export const Select = ({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
    {...props}
  >
    {children}
  </select>
);

