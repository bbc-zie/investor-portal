type ErrorStateProps = {
  title?: string;
  message?: string;
};

export const ErrorState = ({ title = "Something went wrong", message }: ErrorStateProps) => (
  <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <p className="font-semibold">{title}</p>
    {message ? <p className="mt-1">{message}</p> : null}
  </div>
);

