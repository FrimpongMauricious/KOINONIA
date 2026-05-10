import { apiClient } from "@/src/api/client";
import { CreatePostRequest, LikeResponse, Page, PostResponse, Topic } from "@/src/api/types";

export async function fetchFeed(
  page: number,
  size = 20,
  topic?: Topic,
): Promise<Page<PostResponse>> {
  const res = await apiClient.get<Page<PostResponse>>("/api/v1/posts", {
    params: { page, size, ...(topic && { topic }) },
  });
  return res.data;
}

export async function fetchPostById(id: number): Promise<PostResponse> {
  const res = await apiClient.get<PostResponse>(`/api/v1/posts/${id}`);
  return res.data;
}

export async function createPost(payload: CreatePostRequest): Promise<PostResponse> {
  const res = await apiClient.post<PostResponse>("/api/v1/posts", payload);
  return res.data;
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}`);
}

export async function likePost(id: number): Promise<LikeResponse> {
  const res = await apiClient.post<LikeResponse>(`/api/v1/posts/${id}/like`);
  return res.data;
}

export async function unlikePost(id: number): Promise<LikeResponse> {
  const res = await apiClient.delete<LikeResponse>(`/api/v1/posts/${id}/like`);
  return res.data;
}

export async function repostPost(id: number): Promise<PostResponse> {
  const res = await apiClient.post<PostResponse>(
    `/api/v1/posts/${id}/repost`,
  );
  return res.data;
}

export async function unrepostPost(id: number): Promise<PostResponse> {
  const res = await apiClient.delete<PostResponse>(
    `/api/v1/posts/${id}/repost`,
  );
  return res.data;
}

export async function favoritePost(id: number): Promise<PostResponse> {
  const res = await apiClient.post<PostResponse>(
    `/api/v1/posts/${id}/favorite`,
  );
  return res.data;
}

export async function unfavoritePost(id: number): Promise<PostResponse> {
  const res = await apiClient.delete<PostResponse>(
    `/api/v1/posts/${id}/favorite`,
  );
  return res.data;
}

export async function fetchMyFavorites(
  page: number,
  size = 20,
): Promise<Page<PostResponse>> {
  const res = await apiClient.get<Page<PostResponse>>(
    "/api/v1/users/me/favorites",
    { params: { page, size } },
  );
  return res.data;
}
