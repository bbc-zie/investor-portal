import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { getTestDbResult, type TestDbResponse } from "../api/testDb";

type RequestState =
  | { status: "loading" }
  | { status: "success"; result: TestDbResponse }
  | { status: "error"; message: string };

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as { message?: string } | undefined;
    return responseData?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to test the database connection.";
}

export function TestDbPage() {
  const [requestState, setRequestState] = useState<RequestState>({
    status: "loading",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTestResult() {
      try {
        const result = await getTestDbResult();

        if (isMounted) {
          setRequestState({ status: "success", result });
        }
      } catch (error) {
        if (isMounted) {
          setRequestState({ status: "error", message: getErrorMessage(error) });
        }
      }
    }

    void loadTestResult();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Investor Portal
          </p>
          <h1 className="mt-3 text-2xl font-semibold">
            Database Connectivity Test
          </h1>

          <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-5">
            {requestState.status === "loading" ? (
              <p className="text-slate-600">Checking database connection...</p>
            ) : null}

            {requestState.status === "error" ? (
              <div>
                <p className="font-semibold text-red-700">
                  Database Connection Failed
                </p>
                <p className="mt-2 break-words text-sm text-slate-700">
                  {requestState.message}
                </p>
              </div>
            ) : null}

            {requestState.status === "success" &&
            requestState.result.success ? (
              <div>
                <p className="font-semibold text-emerald-700">
                  Database Connection Successful
                </p>
                <p className="mt-2 text-slate-800">
                  ID: {requestState.result.data.id}
                </p>
              </div>
            ) : null}

            {requestState.status === "success" &&
            !requestState.result.success ? (
              <div>
                <p className="font-semibold text-amber-700">
                  Database Connection Returned No Records
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {requestState.result.message}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
