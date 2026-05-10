import { useQuery } from "@tanstack/react-query";

import { fetchTopics } from "@/src/api/topics";

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    staleTime: 60_000,
  });
}
