import axios, { AxiosHeaders } from "axios";
import { API_BASE_PATH } from "@bbc-investor-portal/shared";
import { getDevAuthUser } from "../auth/auth-context";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? API_BASE_PATH,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const user = getDevAuthUser();
  if (!user) return config;

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", "Bearer dev-auth");
  headers.set("x-dev-auth-user", "true");
  headers.set("x-dev-auth-id", user.id);
  headers.set("x-dev-auth-email", user.email);
  headers.set("x-dev-auth-name", user.name);
  headers.set("x-dev-auth-role", user.role);
  headers.set("x-dev-auth-tier", user.tier);
  headers.set("x-dev-auth-status", user.status);

  config.headers = headers;
  return config;
});
