import { PASSWORD_POLICY } from "../constants/auth.js";

export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Use at least ${PASSWORD_POLICY.minLength} characters.`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Include at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Include at least one lowercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Include at least one number.");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Include at least one special character.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
