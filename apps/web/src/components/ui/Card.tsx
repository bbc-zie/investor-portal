import type { HTMLAttributes, PropsWithChildren } from "react";

export const Card = ({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div className={`rounded-md border border-slate-200 bg-white p-5 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

