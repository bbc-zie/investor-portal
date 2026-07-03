import { useQuery } from "@tanstack/react-query";
import { getTestDb } from "../api/testDb";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/states/ErrorState";
import { LoadingState } from "../components/states/LoadingState";
import { Card } from "../components/ui/Card";

export const TestDbPage = () => {
  const query = useQuery({
    queryKey: ["test-db"],
    queryFn: getTestDb,
    retry: false
  });

  return (
    <>
      <PageHeader title="Database Test" description="Verifies API and database connectivity." />
      {query.isLoading ? <LoadingState label="Checking database" /> : null}
      {query.isError ? <ErrorState message={query.error.message} /> : null}
      {query.data ? (
        <Card>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-medium text-slate-500">Status</dt>
              <dd className="mt-1 text-slate-950">{query.data.status}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Database</dt>
              <dd className="mt-1 text-slate-950">{query.data.database}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Server time</dt>
              <dd className="mt-1 text-slate-950">{query.data.now ?? "Unavailable"}</dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </>
  );
};

