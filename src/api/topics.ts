import { apiClient } from "@/src/api/client";
import { TopicsResponse } from "@/src/api/types";

export async function fetchTopics(): Promise<TopicsResponse> {
  const res = await apiClient.get<TopicsResponse>("/api/v1/topics");
  return res.data;
}
