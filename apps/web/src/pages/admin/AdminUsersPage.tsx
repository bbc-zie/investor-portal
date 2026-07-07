import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ACCOUNT_STATUSES,
  INVESTOR_TIERS,
  KYC_STATUSES,
  NDA_STATUSES,
  USER_ROLES,
  WEB_ROUTES,
  type AccountStatus,
  type InvestorTier,
  type KycStatus,
  type NdaStatus,
  type UserManagementListItem,
  type UserRole
} from "@bbc-investor-portal/shared";
import { getUsers, type GetUsersParams } from "../../api/users";
import { PageHeader } from "../../components/layout/PageHeader";
import { ErrorState } from "../../components/states/ErrorState";
import { LoadingState } from "../../components/states/LoadingState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Table, TableBody, TableHead } from "../../components/ui/Table";

type UserFilters = {
  search: string;
  role: UserRole | "";
  tier: InvestorTier | "";
  status: AccountStatus | "";
  kycStatus: KycStatus | "";
  ndaStatus: NdaStatus | "";
  page: number;
  pageSize: number;
};

const defaultFilters: UserFilters = {
  search: "",
  role: "",
  tier: "",
  status: "",
  kycStatus: "",
  ndaStatus: "",
  page: 1,
  pageSize: 10
};

const formatValue = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

const statusTone = (status: UserManagementListItem["status"]) => {
  if (status === "ACTIVE") return "success";
  if (status === "SUSPENDED") return "warning";
  return "danger";
};

const kycTone = (status: UserManagementListItem["kycStatus"]) => {
  if (status === "APPROVED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "neutral";
};

const ndaTone = (status: UserManagementListItem["ndaStatus"]) => {
  if (status === "SIGNED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "EXPIRED") return "danger";
  return "neutral";
};

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);
  const queryParams: GetUsersParams = filters;

  const query = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => getUsers(queryParams),
    retry: false
  });

  const updateFilter = <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const users = query.data?.users ?? [];
  const pagination = query.data?.pagination;

  return (
    <>
      <PageHeader title="User Management" description="Manage investor accounts, access, and review statuses." />

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <label className="xl:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Search</span>
            <Input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Name, email, company, phone"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Role</span>
            <Select value={filters.role} onChange={(event) => updateFilter("role", event.target.value as UserRole | "")}>
              <option value="">All roles</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {formatValue(role)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Tier</span>
            <Select value={filters.tier} onChange={(event) => updateFilter("tier", event.target.value as InvestorTier | "")}>
              <option value="">All tiers</option>
              {INVESTOR_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {formatValue(tier)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Status</span>
            <Select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value as AccountStatus | "")}
            >
              <option value="">All statuses</option>
              {ACCOUNT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatValue(status)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">KYC</span>
            <Select
              value={filters.kycStatus}
              onChange={(event) => updateFilter("kycStatus", event.target.value as KycStatus | "")}
            >
              <option value="">All KYC</option>
              {KYC_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatValue(status)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium uppercase text-slate-500">NDA</span>
            <Select
              value={filters.ndaStatus}
              onChange={(event) => updateFilter("ndaStatus", event.target.value as NdaStatus | "")}
            >
              <option value="">All NDA</option>
              {NDA_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatValue(status)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Card>

      {query.isLoading ? <LoadingState label="Loading users" /> : null}
      {query.isError ? <ErrorState title="Unable to load users" message={query.error.message} /> : null}

      {!query.isLoading && !query.isError && users.length === 0 ? (
        <EmptyState title="No users found" description="Adjust the search or filters to broaden the result set." />
      ) : null}

      {users.length > 0 ? (
        <>
          <Table>
            <TableHead>
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">KYC</th>
                <th className="px-4 py-3">NDA</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">{user.name ?? "Unnamed user"}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatValue(user.role)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatValue(user.tier)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(user.status)}>{formatValue(user.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={kycTone(user.kycStatus)}>{formatValue(user.kycStatus)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ndaTone(user.ndaStatus)}>{formatValue(user.ndaStatus)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => void navigate({ to: WEB_ROUTES.adminUserDetailPath(user.id) })}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1} - {pagination?.total ?? 0} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!pagination || pagination.page <= 1}
                onClick={() => setPage((pagination?.page ?? 1) - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={!pagination || pagination.totalPages === 0 || pagination.page >= pagination.totalPages}
                onClick={() => setPage((pagination?.page ?? 1) + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};
