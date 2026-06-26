import { TestDbPage } from "./pages/TestDbPage";

export function App() {
  const path = window.location.pathname;

  if (path === "/test-db" || path === "/") {
    return <TestDbPage />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Open /test-db to verify the database connection.
        </p>
      </section>
    </main>
  );
}
