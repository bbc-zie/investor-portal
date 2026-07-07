import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { AUTH_ERROR_MESSAGES, WEB_ROUTES } from "@bbc-investor-portal/shared";
import { getDefaultAuthenticatedRoute, isNdaAccepted } from "../auth/access";
import { useAuth } from "../auth/auth-context";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const getSafeRedirect = () => {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return null;
  }

  return redirect;
};

const getNdaErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return AUTH_ERROR_MESSAGES.networkLoginError;
    }

    if (error.response.status === 401) {
      return AUTH_ERROR_MESSAGES.expiredSession;
    }

    if (error.response.status === 403) {
      return AUTH_ERROR_MESSAGES.forbidden;
    }
  }

  return "Unable to accept the NDA. Please try again.";
};

export const NdaPage = () => {
  const navigate = useNavigate();
  const { acceptNda, isAuthenticated, isLoading, logout, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = useMemo(() => getSafeRedirect(), []);

  if (isLoading) {
    return (
      <>
        <PageHeader title="NDA" description="Checking your session." />
        <Card>
          <p className="text-sm text-slate-500">Loading session...</p>
        </Card>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    void navigate({ to: WEB_ROUTES.login });
    return null;
  }

  if (isNdaAccepted(user)) {
    void navigate({ to: redirectTo ?? getDefaultAuthenticatedRoute(user) });
    return null;
  }

  const onAccept = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const acceptedUser = await acceptNda();
      await navigate({ to: redirectTo ?? getDefaultAuthenticatedRoute(acceptedUser) });
    } catch (acceptError) {
      setError(getNdaErrorMessage(acceptError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogout = async () => {
    await logout();
    await navigate({ to: WEB_ROUTES.login });
  };

  return (
    <>
      <PageHeader title="NDA Required" description="Accept the non-disclosure agreement to continue." />
      <Card className="space-y-5">
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>
            Access to approved investor areas requires acceptance of the BBC Investor Portal non-disclosure agreement.
          </p>
          <p>
            By selecting "Accept NDA", you confirm that you agree to keep portal materials confidential and use them only
            for authorized investment review.
          </p>
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" disabled={isSubmitting} onClick={onAccept}>
            {isSubmitting ? "Accepting..." : "Accept NDA"}
          </Button>
          <Button type="button" variant="secondary" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </Card>
    </>
  );
};
