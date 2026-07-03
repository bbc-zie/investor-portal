import type { PropsWithChildren } from "react";

type EmptyStateProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export const EmptyState = ({ title, description, children }: EmptyStateProps) => (
  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
    {description ? <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
    {children ? <div className="mt-4">{children}</div> : null}
  </div>
);

