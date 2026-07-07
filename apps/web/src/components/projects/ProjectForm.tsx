import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { Project, ProjectMutationRequest } from "@bbc-investor-portal/shared";
import { PROJECT_STATUSES, WEB_ROUTES } from "@bbc-investor-portal/shared";
import { createProject, getProjectApiErrorMessage, updateProject } from "../../api/projects";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { dateInputValue, projectStatusLabels } from "./project-utils";

const visibilityOptions = [
  { value: "PRIVATE", label: "Private" },
  { value: "INVESTORS", label: "Investors" },
  { value: "PUBLIC", label: "Public" }
] as const;

const emptyForm: ProjectMutationRequest = {
  name: "",
  slug: "",
  status: "DRAFT",
  investmentType: "",
  location: "",
  summary: "",
  description: "",
  minimumInvestment: "",
  targetRaise: "",
  expectedReturn: "",
  investmentTerm: "",
  openingDate: "",
  closingDate: "",
  heroImageUrl: "",
  coverImageUrl: "",
  visibility: "INVESTORS"
};

const fromProject = (project?: Project): ProjectMutationRequest =>
  project
    ? {
        name: project.name,
        slug: project.slug,
        status: project.status,
        investmentType: project.investmentType,
        location: project.location,
        summary: project.summary ?? "",
        description: project.description ?? "",
        minimumInvestment: project.minimumInvestment,
        targetRaise: project.targetRaise,
        expectedReturn: project.expectedReturn,
        investmentTerm: project.investmentTerm,
        openingDate: dateInputValue(project.openingDate),
        closingDate: dateInputValue(project.closingDate),
        heroImageUrl: project.heroImageUrl ?? "",
        coverImageUrl: project.coverImageUrl ?? "",
        visibility: project.visibility
      }
    : emptyForm;

export const ProjectForm = ({ project }: { project?: Project }) => {
  const [form, setForm] = useState<ProjectMutationRequest>(() => fromProject(project));
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isEdit = Boolean(project);

  const mutation = useMutation({
    mutationFn: (payload: ProjectMutationRequest) => (project ? updateProject(project.id, payload) : createProject(payload)),
    onSuccess: async (savedProject) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await navigate({ to: WEB_ROUTES.adminProjectDetail, params: { projectId: savedProject.id } });
    },
    onError: (mutationError) => setError(getProjectApiErrorMessage(mutationError, "Project could not be saved. Check the fields and try again."))
  });

  const requiredMissing = useMemo(
    () =>
      !form.name ||
      !form.slug ||
      !form.status ||
      !form.investmentType ||
      !form.location ||
      !form.minimumInvestment ||
      !form.targetRaise ||
      !form.expectedReturn ||
      !form.investmentTerm ||
      !form.visibility,
    [form]
  );

  const update = (key: keyof ProjectMutationRequest, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (requiredMissing) {
      setError("Complete all required fields before saving.");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <Card>
      <form className="grid gap-5" onSubmit={submit}>
        {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Project Name
            <Input value={form.name} onChange={(event) => update("name", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Slug
            <Input value={form.slug} onChange={(event) => update("slug", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Status
            <Select value={form.status} onChange={(event) => update("status", event.target.value)} required>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {projectStatusLabels[status]}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Investment Type
            <Input value={form.investmentType} onChange={(event) => update("investmentType", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Location
            <Input value={form.location} onChange={(event) => update("location", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Visibility
            <Select value={form.visibility} onChange={(event) => update("visibility", event.target.value)} required>
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Minimum Investment
            <Input type="number" min="0" step="0.01" value={form.minimumInvestment} onChange={(event) => update("minimumInvestment", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Target Raise
            <Input type="number" min="0" step="0.01" value={form.targetRaise} onChange={(event) => update("targetRaise", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Expected Return
            <Input value={form.expectedReturn} onChange={(event) => update("expectedReturn", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Investment Term
            <Input value={form.investmentTerm} onChange={(event) => update("investmentTerm", event.target.value)} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Opening Date
            <Input type="date" value={form.openingDate ?? ""} onChange={(event) => update("openingDate", event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Closing Date
            <Input type="date" value={form.closingDate ?? ""} onChange={(event) => update("closingDate", event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Hero Image URL
            <Input type="url" value={form.heroImageUrl ?? ""} onChange={(event) => update("heroImageUrl", event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Cover Image URL
            <Input type="url" value={form.coverImageUrl ?? ""} onChange={(event) => update("coverImageUrl", event.target.value)} />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Summary
          <Textarea value={form.summary ?? ""} onChange={(event) => update("summary", event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Description
          <Textarea value={form.description ?? ""} onChange={(event) => update("description", event.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving" : isEdit ? "Save Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
