import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import { likeComment, unlikeComment } from "@/src/api/comment-likes";
import { CommentLikeResponse, CommentResponse, Page } from "@/src/api/types";

type CommentsCache = InfiniteData<Page<CommentResponse>> | undefined;

function patchComment(
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

export function useToggleCommentLike(postId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    CommentLikeResponse,
    Error,
    CommentResponse,
    { snapshot: CommentsCache }
  >({
    mutationFn: (comment) =>
      comment.likedByCurrentUser
        ? unlikeComment(comment.id)
        : likeComment(comment.id),

    onMutate: async (comment) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const snapshot = queryClient.getQueryData<CommentsCache>(["comments", postId]);

      queryClient.setQueryData<CommentsCache>(
        ["comments", postId],
        (old) =>
          patchComment(old, comment.id, (c) => ({
            ...c,
            likedByCurrentUser: !c.likedByCurrentUser,
            likeCount: c.likedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1,
          })),
      );

      return { snapshot };
    },

    onError: (_err, _comment, ctx) => {
      if (ctx?.snapshot !== undefined) {
        queryClient.setQueryData(["comments", postId], ctx.snapshot);
      }
    },

    onSuccess: (serverResponse, comment) => {
      queryClient.setQueryData<CommentsCache>(
        ["comments", postId],
        (old) =>
          patchComment(old, comment.id, (c) => ({
            ...c,
            likedByCurrentUser: serverResponse.likedByCurrentUser,
            likeCount: serverResponse.likeCount,
          })),
      );
    },
  });
}
