import { apiClient } from "@/src/api/client";
import { FollowResponse } from "@/src/api/types";

export async function followUser(userId: number): Promise<FollowResponse> {
  const res = await apiClient.post<FollowResponse>(
    `/api/v1/users/${userId}/follow`,
  );
  return res.data;
}

export async function unfollowUser(userId: number): Promise<FollowResponse> {
  const res = await apiClient.delete<FollowResponse>(
    `/api/v1/users/${userId}/follow`,
  );
  return res.data;
}
