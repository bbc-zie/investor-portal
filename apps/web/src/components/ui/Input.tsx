import type { InputHTMLAttributes } from "react";

export const Input = ({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
    {...props}
  />
);

