import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import { likeComment, unlikeComment } from "@/src/api/comment-likes";
import { CommentLikeResponse, CommentResponse, Page } from "@/src/api/types";

type CommentsCache = InfiniteData<Page<CommentResponse>> | undefined;

function patchCommentInCache(
  old: CommentsCache,
  commentId: number,
  updater: (c: CommentResponse) => CommentResponse,
): CommentsCache {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((c) => (c.id === commentId ? updater(c) : c)),
    })),
  };
}

function patchAllCommentCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  commentId: number,
  updater: (c: CommentResponse) => CommentResponse,
) {
  for (const [key, old] of queryClient.getQueriesData<CommentsCache>({ queryKey: ["comments"] })) {
    queryClient.setQueryData<CommentsCache>(key, patchCommentInCache(old, commentId, updater));
  }
  for (const [key, old] of queryClient.getQueriesData<CommentsCache>({ queryKey: ["replies"] })) {
    queryClient.setQueryData<CommentsCache>(key, patchCommentInCache(old, commentId, updater));
  }
}

function snapshotAllCommentCaches(queryClient: ReturnType<typeof useQueryClient>) {
  return {
    comments: queryClient.getQueriesData<CommentsCache>({ queryKey: ["comments"] }),
    replies: queryClient.getQueriesData<CommentsCache>({ queryKey: ["replies"] }),
  };
}

function restoreAllCommentCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: ReturnType<typeof snapshotAllCommentCaches>,
) {
  for (const [key, data] of snapshot.comments) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.replies) {
    queryClient.setQueryData(key, data);
  }
}

export function useToggleCommentLike(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentLikeResponse,
    Error,
    CommentResponse,
    { snapshot: ReturnType<typeof snapshotAllCommentCaches> }
  >({
    mutationFn: (comment) =>
      comment.likedByCurrentUser
        ? unlikeComment(comment.id)
        : likeComment(comment.id),

    onMutate: async (comment) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      await queryClient.cancelQueries({ queryKey: ["replies"] });

      const snapshot = snapshotAllCommentCaches(queryClient);

      patchAllCommentCaches(queryClient, comment.id, (c) => ({
        ...c,
        likedByCurrentUser: !c.likedByCurrentUser,
        likeCount: c.likedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1,
      }));

      return { snapshot };
    },

    onError: (_err, _comment, ctx) => {
      if (ctx?.snapshot) {
        restoreAllCommentCaches(queryClient, ctx.snapshot);
      }
    },

    onSuccess: (serverResponse, comment) => {
      patchAllCommentCaches(queryClient, comment.id, (c) => ({
        ...c,
        likedByCurrentUser: serverResponse.likedByCurrentUser,
        likeCount: serverResponse.likeCount,
      }));
    },
  });
}
