import { apiClient } from "./client";

export type TestDbResponse =
  | {
      success: true;
      data: {
        id: string;
      };
    }
  | {
      success: false;
      message: string;
    };

export async function getTestDbResult() {
  const response = await apiClient.get<TestDbResponse>("/test-db");
  return response.data;
}
