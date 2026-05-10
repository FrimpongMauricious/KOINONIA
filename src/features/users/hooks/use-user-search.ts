import { useQuery } from "@tanstack/react-query";

import { searchUsers } from "@/src/api/users";
import { Page, PublicUserProfileResponse } from "@/src/api/types";

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["user-search", query],
    queryFn: () => searchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 30_000,
  });
}
