import { useQuery } from "@tanstack/react-query";

import { fetchUserById } from "@/src/api/users";

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: userId > 0,
  });
}
