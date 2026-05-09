import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchNotifications } from "@/src/api/notifications";
import { NotificationResponse } from "@/src/api/types";

export function useNotifications() {
  const query = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchNotifications(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });

  const notifications: NotificationResponse[] =
    query.data?.pages.flatMap((page) => page.content) ?? [];

  return {
    ...query,
    notifications,
  };
}
