import type { TextareaHTMLAttributes } from "react";

export const Textarea = ({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
    {...props}
  />
);

