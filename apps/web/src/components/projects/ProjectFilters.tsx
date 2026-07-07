import type { ProjectListQuery } from "@bbc-investor-portal/shared";
import { PROJECT_STATUSES } from "@bbc-investor-portal/shared";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { projectStatusLabels } from "./project-utils";

type ProjectFiltersProps = {
  value: ProjectListQuery;
  locations: string[];
  investmentTypes: string[];
  onChange: (value: ProjectListQuery) => void;
};

export const ProjectFilters = ({ value, locations, investmentTypes, onChange }: ProjectFiltersProps) => {
  const update = (patch: ProjectListQuery) => onChange({ ...value, ...patch, page: 1 });

  return (
    <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-5">
      <Input placeholder="Search projects" value={value.search ?? ""} onChange={(event) => update({ search: event.target.value })} />
      <Select value={value.status ?? ""} onChange={(event) => update({ status: event.target.value as ProjectListQuery["status"] })}>
        <option value="">All statuses</option>
        {PROJECT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {projectStatusLabels[status]}
          </option>
        ))}
      </Select>
      <Select value={value.location ?? ""} onChange={(event) => update({ location: event.target.value })}>
        <option value="">All locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </Select>
      <Select value={value.investmentType ?? ""} onChange={(event) => update({ investmentType: event.target.value })}>
        <option value="">All types</option>
        {investmentTypes.map((investmentType) => (
          <option key={investmentType} value={investmentType}>
            {investmentType}
          </option>
        ))}
      </Select>
      <Select value={value.sort ?? "newest"} onChange={(event) => update({ sort: event.target.value as ProjectListQuery["sort"] })}>
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="targetRaise">Target Raise</option>
        <option value="alphabetical">Alphabetical</option>
      </Select>
    </div>
  );
};
