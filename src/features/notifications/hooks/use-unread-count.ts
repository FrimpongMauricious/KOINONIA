import { useQuery } from "@tanstack/react-query";

import { fetchUnreadCount } from "@/src/api/notifications";

export function useUnreadCount(enabled: boolean) {
  const query = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    enabled,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 25_000,
  });

  return {
    ...query,
    count: query.data?.count ?? 0,
  };
}
