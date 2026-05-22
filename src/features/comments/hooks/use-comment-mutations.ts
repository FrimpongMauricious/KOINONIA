import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

import { createComment, deleteComment } from "@/src/api/comments";
import { fetchMyStreak } from "@/src/api/streak";
import { CommentResponse, Page, PostResponse } from "@/src/api/types";

const STREAK_MILESTONES: Record<number, string> = {
  7: "One week of fellowship! 🔥",
  14: "Two weeks strong! 🔥🔥",
  30: "A month of daily devotion! 🔥🔥",
  100: "Century of faith! 🔥🔥🔥",
  365: "A year in the Word! 🔥🔥🔥🔥",
};

function patchCommentCount(
  old: InfiniteData<Page<PostResponse>> | undefined,
  postId: number,
  delta: number,
): InfiniteData<Page<PostResponse>> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p,
      ),
    })),
  };
}

function applyCommentCountDelta(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  delta: number,
) {
  for (const [key, old] of queryClient.getQueriesData<InfiniteData<Page<PostResponse>>>({
    queryKey: ["feed"],
  })) {
    queryClient.setQueryData(key, patchCommentCount(old, postId, delta));
  }

  for (const [key, old] of queryClient.getQueriesData<InfiniteData<Page<PostResponse>>>({
    queryKey: ["user-posts"],
  })) {
    queryClient.setQueryData(key, patchCommentCount(old, postId, delta));
  }
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, string>({
    mutationFn: (content) => createComment(postId, content),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      applyCommentCountDelta(queryClient, postId, 1);
      queryClient.setQueryData<PostResponse>(
        ["post", postId],
        (old) => (old ? { ...old, commentCount: old.commentCount + 1 } : old),
      );
      queryClient.invalidateQueries({ queryKey: ["my-streak"] });

      const streak = await fetchMyStreak();
      if (STREAK_MILESTONES[streak.currentStreak]) {
        Alert.alert("Streak Milestone!", STREAK_MILESTONES[streak.currentStreak]);
      }
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      applyCommentCountDelta(queryClient, postId, -1);
      queryClient.setQueryData<PostResponse>(
        ["post", postId],
        (old) =>
          old ? { ...old, commentCount: Math.max(0, old.commentCount - 1) } : old,
      );
    },
  });
}
