import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import { createComment, deleteComment } from "@/src/api/comments";
import { CommentResponse, Page, PostResponse } from "@/src/api/types";

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

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<CommentResponse, Error, string>({
    mutationFn: (content) => createComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) => patchCommentCount(old, postId, 1),
      );
      queryClient.setQueryData<PostResponse>(
        ["post", postId],
        (old) => (old ? { ...old, commentCount: old.commentCount + 1 } : old),
      );
    },
  });
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) => patchCommentCount(old, postId, -1),
      );
      queryClient.setQueryData<PostResponse>(
        ["post", postId],
        (old) => (old ? { ...old, commentCount: Math.max(0, old.commentCount - 1) } : old),
      );
    },
  });
}
