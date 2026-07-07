import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, type PropsWithChildren } from "react";
import {
  ACCOUNT_STATUSES,
  INVESTOR_TIERS,
  KYC_STATUSES,
  USER_ROLES,
  WEB_ROUTES,
  type AccountStatus,
  type InvestorTier,
  type KycStatus,
  type UpdateUserResponse,
  type UserManagementDetail,
  type UserRole
} from "@bbc-investor-portal/shared";
import { getUser, updateUserKyc, updateUserRoleTier, updateUserStatus } from "../../api/users";
import { useAuth } from "../../auth/auth-context";
import { PageHeader } from "../../components/layout/PageHeader";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";

const formatValue = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value?: string | null) => {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
};

const statusTone = (status: UserManagementDetail["status"]) => {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "warning";
  return "danger";
};

const kycTone = (status: UserManagementDetail["kycStatus"]) => {
  if (status === "APPROVED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "neutral";
};

const ndaTone = (status: UserManagementDetail["ndaStatus"]) => {
  if (status === "SIGNED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "EXPIRED") return "danger";
  return "neutral";
};

const isNotFoundError = (error: unknown) => isAxiosError(error) && error.response?.status === 404;

const DetailField = ({ label, children }: PropsWithChildren<{ label: string }>) => (
  <div>
    <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm text-slate-950">{children}</dd>
  </div>
);

export const AdminUserDetailPage = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { userId?: string };
  const userId = params.userId ?? "";
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [role, setRole] = useState<UserRole>("INVESTOR");
  const [tier, setTier] = useState<InvestorTier>("PUBLIC");
  const [kycStatus, setKycStatus] = useState<KycStatus>("NOT_STARTED");

  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: Boolean(userId),
    retry: false
  });

  const user = query.data?.user;

  useEffect(() => {
    if (!user) return;

    setRole(user.role);
    setTier(user.tier);
    setKycStatus(user.kycStatus);
  }, [user]);

  const onMutationSuccess = (data: UpdateUserResponse) => {
    queryClient.setQueryData(["user", userId], { user: data.user });
    void queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const statusMutation = useMutation({
    mutationFn: (nextStatus: AccountStatus) => updateUserStatus(userId, nextStatus),
    onSuccess: onMutationSuccess
  });

  const roleTierMutation = useMutation({
    mutationFn: () => updateUserRoleTier(userId, role, tier),
    onSuccess: onMutationSuccess
  });

  const kycMutation = useMutation({
    mutationFn: () => updateUserKyc(userId, kycStatus),
    onSuccess: onMutationSuccess
  });

  const updateStatus = (nextStatus: AccountStatus) => {
    if (
      (nextStatus === "SUSPENDED" || nextStatus === "DEACTIVATED") &&
      !window.confirm(`Confirm ${formatValue(nextStatus).toLowerCase()} for this user.`)
    ) {
      return;
    }

    statusMutation.mutate(nextStatus);
  };

  const mutationError = statusMutation.error ?? roleTierMutation.error ?? kycMutation.error;

  if (query.isLoading) {
    return <LoadingState label="Loading user" />;
  }

  if (query.isError) {
    if (isNotFoundError(query.error)) {
      return <ErrorState title="User not found" message="The requested user does not exist or is no longer available." />;
    }

    return <ErrorState title="Unable to load user" message={query.error.message} />;
  }

  if (!user) {
    return <ErrorState title="User not found" message="The requested user could not be loaded." />;
  }

  const roleTierChanged = role !== user.role || tier !== user.tier;
  const kycChanged = kycStatus !== user.kycStatus;
  const currentUserIsSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const roleOptions = currentUserIsSuperAdmin ? USER_ROLES : USER_ROLES.filter((option) => option !== "SUPER_ADMIN");
  const privilegedTargetLocked = !currentUserIsSuperAdmin && user.role === "SUPER_ADMIN";

  return (
    <>
      <PageHeader title={user.name ?? user.email} description={user.email}>
        <Button variant="secondary" onClick={() => void navigate({ to: WEB_ROUTES.adminUsers })}>
          Back
        </Button>
      </PageHeader>

      {mutationError ? <ErrorState title="Unable to update user" message={mutationError.message} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-950">Identity</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Display name">{user.name ?? "Unnamed user"}</DetailField>
              <DetailField label="Email">{user.email}</DetailField>
              <DetailField label="Legal name">{user.investorProfile?.legalName ?? "Not recorded"}</DetailField>
              <DetailField label="Company">{user.investorProfile?.company ?? "Not recorded"}</DetailField>
              <DetailField label="Phone">{user.investorProfile?.phone ?? "Not recorded"}</DetailField>
              <DetailField label="Created">{formatDate(user.createdAt)}</DetailField>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-950">Account</h2>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailField label="Role">{formatValue(user.role)}</DetailField>
              <DetailField label="Tier">{formatValue(user.tier)}</DetailField>
              <DetailField label="Account status">
                <Badge tone={statusTone(user.status)}>{formatValue(user.status)}</Badge>
              </DetailField>
              <DetailField label="KYC status">
                <Badge tone={kycTone(user.kycStatus)}>{formatValue(user.kycStatus)}</Badge>
              </DetailField>
              <DetailField label="NDA status">
                <Badge tone={ndaTone(user.ndaStatus)}>{formatValue(user.ndaStatus)}</Badge>
              </DetailField>
              <DetailField label="NDA signed">{formatDate(user.ndaRecord?.signedAt)}</DetailField>
            </dl>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-950">Actions</h2>

          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-sm font-medium text-slate-950">Account status</h3>
              <div className="grid gap-2">
                {ACCOUNT_STATUSES.map((status) => (
                  <Button
                    key={status}
                    variant={status === "ACTIVE" ? "primary" : "secondary"}
                    className={status === "DEACTIVATED" ? "border-red-200 text-red-700 hover:bg-red-50" : ""}
                    disabled={statusMutation.isPending || privilegedTargetLocked || status === user.status}
                    onClick={() => updateStatus(status)}
                  >
                    {formatValue(status)}
                  </Button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium text-slate-950">Role and tier</h3>
              <div className="space-y-3">
                <label>
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Role</span>
                  <Select
                    value={role}
                    disabled={privilegedTargetLocked}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                  >
                    {!currentUserIsSuperAdmin && role === "SUPER_ADMIN" ? (
                      <option value="SUPER_ADMIN" disabled>
                        {formatValue("SUPER_ADMIN")}
                      </option>
                    ) : null}
                    {roleOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatValue(option)}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Tier</span>
                  <Select
                    value={tier}
                    disabled={privilegedTargetLocked}
                    onChange={(event) => setTier(event.target.value as InvestorTier)}
                  >
                    {INVESTOR_TIERS.map((option) => (
                      <option key={option} value={option}>
                        {formatValue(option)}
                      </option>
                    ))}
                  </Select>
                </label>
                <Button
                  className="w-full"
                  disabled={roleTierMutation.isPending || privilegedTargetLocked || !roleTierChanged}
                  onClick={() => roleTierMutation.mutate()}
                >
                  Save role and tier
                </Button>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium text-slate-950">KYC status</h3>
              <div className="space-y-3">
                <Select
                  value={kycStatus}
                  disabled={privilegedTargetLocked}
                  onChange={(event) => setKycStatus(event.target.value as KycStatus)}
                >
                  {KYC_STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {formatValue(option)}
                    </option>
                  ))}
                </Select>
                <Button
                  className="w-full"
                  disabled={kycMutation.isPending || privilegedTargetLocked || !kycChanged}
                  onClick={() => kycMutation.mutate()}
                >
                  Save KYC status
                </Button>
              </div>
            </section>
          </div>
        </Card>
      </div>
    </>
  );
};
