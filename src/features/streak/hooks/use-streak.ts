import { useQuery } from "@tanstack/react-query";

import { fetchMyStreak, fetchUserStreak } from "@/src/api/streak";
import { useAuth } from "@/src/auth/auth-context";

export function useMyStreak() {
  const { status } = useAuth();

  return useQuery({
    queryKey: ["my-streak"],
    queryFn: fetchMyStreak,
    staleTime: 60_000,
    enabled: status === "authenticated",
  });
}

export function useUserStreak(userId: number) {
  return useQuery({
    queryKey: ["user-streak", userId],
    queryFn: () => fetchUserStreak(userId),
    staleTime: 60_000,
    enabled: userId > 0,
  });
}
