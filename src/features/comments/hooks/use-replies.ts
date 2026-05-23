import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchReplies } from "@/src/api/comment-replies";
import { CommentResponse } from "@/src/api/types";

export function useReplies(commentId: number, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ["replies", commentId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchReplies(commentId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: enabled && commentId > 0,
  });

  const replies: CommentResponse[] =
    query.data?.pages.flatMap((p) => p.content) ?? [];

  return { ...query, replies };
}
