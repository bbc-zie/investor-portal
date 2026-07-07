import type { ProjectListQuery, ProjectListResponse, ProjectMutationRequest, ProjectResponse } from "@bbc-investor-portal/shared";
import { API_ENDPOINTS } from "@bbc-investor-portal/shared";
import axios from "axios";
import { apiClient } from "./client";

type ApiErrorBody = {
  error?: string;
  message?: string;
};

export const getProjectApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.response?.data?.error ?? fallback;
  }

  return fallback;
};

export const listProjects = async (query: ProjectListQuery) => {
  const { data } = await apiClient.get<ProjectListResponse>(API_ENDPOINTS.projects, { params: query });
  return data;
};

export const getProject = async (id: string) => {
  const { data } = await apiClient.get<ProjectResponse>(`${API_ENDPOINTS.projects}/${id}`);
  return data.project;
};

export const createProject = async (payload: ProjectMutationRequest) => {
  const { data } = await apiClient.post<ProjectResponse>(API_ENDPOINTS.projects, payload);
  return data.project;
};

export const updateProject = async (id: string, payload: ProjectMutationRequest) => {
  const { data } = await apiClient.put<ProjectResponse>(`${API_ENDPOINTS.projects}/${id}`, payload);
  return data.project;
};

export const deleteProject = async (id: string) => {
  await apiClient.delete(`${API_ENDPOINTS.projects}/${id}`);
};
