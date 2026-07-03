type LoadingStateProps = {
  label?: string;
};

export const LoadingState = ({ label = "Loading" }: LoadingStateProps) => (
  <div className="flex min-h-32 items-center justify-center rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
    {label}
  </div>
);

