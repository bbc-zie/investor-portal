import bcrypt from "bcrypt";
import {
  ACCOUNT_STATUSES,
  DEFAULT_ACCOUNT_STATUS,
  DEFAULT_INVESTOR_TIER,
  DEFAULT_USER_ROLE,
  INVESTOR_TIERS,
  USER_ROLES,
  validatePassword,
  type AccountStatus,
  type InvestorTier,
  type UserRole
} from "@bbc-investor-portal/shared";
import { prisma } from "../lib/prisma.js";

const readArg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
};

const assertChoice = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) => {
  if (!value) return fallback;
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid value "${value}". Allowed values: ${allowed.join(", ")}`);
  }

  return value as T;
};

const main = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run dev-user seed in production.");
  }

  const email = (readArg("email") ?? process.env.DEV_USER_EMAIL)?.toLowerCase().trim();
  const password = readArg("password") ?? process.env.DEV_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Provide --email and --password, or set DEV_USER_EMAIL and DEV_USER_PASSWORD before running this script."
    );
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(`Development user password is too weak: ${passwordValidation.errors.join(" ")}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const role = assertChoice<UserRole>(readArg("role") ?? process.env.DEV_USER_ROLE, USER_ROLES, DEFAULT_USER_ROLE);
  const tier = assertChoice<InvestorTier>(
    readArg("tier") ?? process.env.DEV_USER_TIER,
    INVESTOR_TIERS,
    DEFAULT_INVESTOR_TIER
  );
  const status = assertChoice<AccountStatus>(
    readArg("status") ?? process.env.DEV_USER_STATUS,
    ACCOUNT_STATUSES,
    DEFAULT_ACCOUNT_STATUS
  );

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, tier, status },
    create: {
      email,
      name: readArg("name") ?? process.env.DEV_USER_NAME ?? "Development User",
      passwordHash,
      role,
      tier,
      status
    }
  });

  console.log(`Seeded development user ${user.email} (${user.role}).`);
};

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
