import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <Card>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
  </Card>
);

