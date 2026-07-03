import axios from "axios";
import { API_BASE_PATH } from "@bbc-investor-portal/shared";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? API_BASE_PATH,
  headers: {
    "Content-Type": "application/json"
  }
});
