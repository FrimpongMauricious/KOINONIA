import { apiClient } from "@/src/api/client";
import { UserStreakResponse } from "@/src/api/types";

export async function fetchMyStreak(): Promise<UserStreakResponse> {
  const res = await apiClient.get<UserStreakResponse>("/api/v1/users/me/streak");
  return res.data;
}

export async function fetchUserStreak(userId: number): Promise<UserStreakResponse> {
  const res = await apiClient.get<UserStreakResponse>(`/api/v1/users/${userId}/streak`);
  return res.data;
}
