import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMyFavorites } from "@/src/api/posts";
import { PostResponse } from "@/src/api/types";

export function useFavorites() {
  const query = useInfiniteQuery({
    queryKey: ["my-favorites"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchMyFavorites(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

  const posts: PostResponse[] =
    query.data?.pages.flatMap((p) => p.content) ?? [];

  return { ...query, posts };
}
