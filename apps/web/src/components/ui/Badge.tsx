import type { PropsWithChildren } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
}>;

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700"
};

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
);

