import { apiClient } from "./client";
import { API_ENDPOINTS, type TestDbResponse } from "@bbc-investor-portal/shared";

export const getTestDb = async () => {
  const response = await apiClient.get<TestDbResponse>(API_ENDPOINTS.testDb);
  return response.data;
};
