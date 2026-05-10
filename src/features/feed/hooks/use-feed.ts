import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFeed } from "@/src/api/posts";
import { PostResponse, Topic } from "@/src/api/types";

export function useFeed(topic?: Topic) {
  const query = useInfiniteQuery({
    queryKey: ["feed", topic ?? "all"],
    queryFn: ({ pageParam }: { pageParam: number }) => fetchFeed(pageParam, 20, topic),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

  const posts: PostResponse[] =
    query.data?.pages.flatMap((p) => p.content) ?? [];

  return { ...query, posts };
}
