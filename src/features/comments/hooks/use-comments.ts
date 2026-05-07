import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchComments } from "@/src/api/comments";
import { CommentResponse } from "@/src/api/types";

export function useComments(postId: number) {
  const query = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchComments(postId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: postId > 0,
  });

  const comments: CommentResponse[] =
    query.data?.pages.flatMap((p) => p.content) ?? [];

  return { ...query, comments };
}
