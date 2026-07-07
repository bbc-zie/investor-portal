export type AuthAuditEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "TOKEN_REFRESH"
  | "PASSWORD_CHANGED";

export type AuthAuditEvent = {
  type: AuthAuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export interface AuthAuditLogger {
  record(event: AuthAuditEvent): Promise<void>;
}

export const authAuditLogger: AuthAuditLogger = {
  async record(_event) {
    // TODO: Wire this to the Audit Logs module when it is implemented.
  }
};
