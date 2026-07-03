import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { ADMIN_ROLES, AUTH_ERROR_MESSAGES, WEB_ROUTES } from "@bbc-investor-portal/shared";
import { useAuth } from "../auth/auth-context";
import { consumeAuthSessionMessage } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return AUTH_ERROR_MESSAGES.networkLoginError;
    }

    if (error.response.status === 401) {
      return AUTH_ERROR_MESSAGES.invalidCredentials;
    }

    if (error.response.status === 429) {
      return AUTH_ERROR_MESSAGES.tooManyLoginAttempts;
    }

    if (error.response.status >= 500) {
      return AUTH_ERROR_MESSAGES.unexpectedLoginError;
    }

    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? AUTH_ERROR_MESSAGES.unexpectedLoginError;
  }

  return AUTH_ERROR_MESSAGES.unexpectedLoginError;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError(consumeAuthSessionMessage());
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      await navigate({
        to: ADMIN_ROLES.includes(user.role) ? WEB_ROUTES.adminDashboard : WEB_ROUTES.investorDashboard
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Login" description="Sign in to continue." />
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </>
  );
};

