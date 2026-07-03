import type { AuthenticatedUser } from "@bbc-investor-portal/shared";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
