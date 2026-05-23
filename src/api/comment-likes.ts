import { apiClient } from "@/src/api/client";
import { CommentLikeResponse } from "@/src/api/types";

export async function likeComment(commentId: number): Promise<CommentLikeResponse> {
  const res = await apiClient.post<CommentLikeResponse>(
    `/api/v1/comments/${commentId}/like`,
  );
  return res.data;
}

export async function unlikeComment(commentId: number): Promise<CommentLikeResponse> {
  const res = await apiClient.delete<CommentLikeResponse>(
    `/api/v1/comments/${commentId}/like`,
  );
  return res.data;
}
