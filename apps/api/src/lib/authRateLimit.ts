import { AUTH_RATE_LIMIT } from "@bbc-investor-portal/shared";

type LoginAttempt = {
  count: number;
  firstFailedAt: number;
};

const failedLoginAttempts = new Map<string, LoginAttempt>();

const getKey = (email: string, ipAddress?: string) => `${email.toLowerCase().trim()}:${ipAddress ?? "unknown"}`;

const pruneExpiredAttempt = (key: string, now: number) => {
  const attempt = failedLoginAttempts.get(key);
  if (!attempt) return;

  if (now - attempt.firstFailedAt >= AUTH_RATE_LIMIT.loginWindowMs) {
    failedLoginAttempts.delete(key);
  }
};

export const isLoginRateLimited = (email: string, ipAddress?: string) => {
  const key = getKey(email, ipAddress);
  const now = Date.now();
  pruneExpiredAttempt(key, now);

  const attempt = failedLoginAttempts.get(key);
  return Boolean(attempt && attempt.count >= AUTH_RATE_LIMIT.loginFailedAttempts);
};

export const recordFailedLogin = (email: string, ipAddress?: string) => {
  const key = getKey(email, ipAddress);
  const now = Date.now();
  pruneExpiredAttempt(key, now);

  const attempt = failedLoginAttempts.get(key);
  if (!attempt) {
    failedLoginAttempts.set(key, { count: 1, firstFailedAt: now });
    return;
  }

  attempt.count += 1;
};

export const clearFailedLogins = (email: string, ipAddress?: string) => {
  failedLoginAttempts.delete(getKey(email, ipAddress));
};

// TODO: Replace this process-local limiter with a distributed store before horizontal scaling.
