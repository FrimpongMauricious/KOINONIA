import { apiClient } from "@/src/api/client";
import { CommentResponse, Page } from "@/src/api/types";

export async function fetchReplies(
  commentId: number,
  page: number,
  size = 20,
): Promise<Page<CommentResponse>> {
  const res = await apiClient.get<Page<CommentResponse>>(
    `/api/v1/comments/${commentId}/replies`,
    { params: { page, size } },
  );
  return res.data;
}
