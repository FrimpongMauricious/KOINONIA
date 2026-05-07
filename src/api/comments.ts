import { apiClient } from "@/src/api/client";
import { CommentResponse, Page } from "@/src/api/types";

export async function fetchComments(
  postId: number,
  page: number,
  size = 50,
): Promise<Page<CommentResponse>> {
  const res = await apiClient.get<Page<CommentResponse>>(
    `/api/v1/posts/${postId}/comments`,
    { params: { page, size } },
  );
  return res.data;
}

export async function createComment(
  postId: number,
  content: string,
): Promise<CommentResponse> {
  const res = await apiClient.post<CommentResponse>(
    `/api/v1/posts/${postId}/comments`,
    { content },
  );
  return res.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/api/v1/comments/${commentId}`);
}
