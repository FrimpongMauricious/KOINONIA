import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFeed } from "@/src/api/posts";
import { PostResponse } from "@/src/api/types";

export function useFeed() {
  const query = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }: { pageParam: number }) => fetchFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

  const posts: PostResponse[] =
    query.data?.pages.flatMap((p) => p.content) ?? [];

  return { ...query, posts };
}
