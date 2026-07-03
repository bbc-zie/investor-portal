import type { PropsWithChildren } from "react";

type PageHeaderProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    {children ? <div className="flex items-center gap-2">{children}</div> : null}
  </div>
);

