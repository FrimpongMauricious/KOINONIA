import { apiClient } from "@/src/api/client";
import { Page, PostResponse } from "@/src/api/types";

export async function fetchUserPosts(
  userId: number,
  page = 0,
  size = 20,
): Promise<Page<PostResponse>> {
  const res = await apiClient.get<Page<PostResponse>>(
    `/api/v1/users/${userId}/posts`,
    { params: { page, size } },
  );
  return res.data;
}
