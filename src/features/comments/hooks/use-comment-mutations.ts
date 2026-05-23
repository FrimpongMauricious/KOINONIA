import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import { createComment, deleteComment } from "@/src/api/comments";
import { CommentResponse, CreateCommentRequest, Page, PostResponse } from "@/src/api/types";

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

  return useMutation<CommentResponse, Error, CreateCommentRequest>({
    mutationFn: (req) => createComment(postId, req),
    onSuccess: (_data, req) => {
      if (req.parentId != null) {
        queryClient.invalidateQueries({ queryKey: ["replies", req.parentId] });
        // increment replyCount on the parent comment in the comments cache
        queryClient.setQueryData<InfiniteData<Page<CommentResponse>>>(
          ["comments", postId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                content: page.content.map((c) =>
                  c.id === req.parentId
                    ? { ...c, replyCount: c.replyCount + 1 }
                    : c,
                ),
              })),
            };
          },
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        applyCommentCountDelta(queryClient, postId, 1);
        queryClient.setQueryData<PostResponse>(
          ["post", postId],
          (old) => (old ? { ...old, commentCount: old.commentCount + 1 } : old),
        );
        queryClient.invalidateQueries({ queryKey: ["my-streak"] });
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
