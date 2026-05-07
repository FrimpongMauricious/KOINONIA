import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPost,
  favoritePost,
  likePost,
  repostPost,
  unfavoritePost,
  unlikePost,
  unrepostPost,
} from "@/src/api/posts";
import { LikeResponse, Page, PostResponse } from "@/src/api/types";

function patchFeedPost(
  old: InfiniteData<Page<PostResponse>> | undefined,
  postId: number,
  updater: (p: PostResponse) => PostResponse,
): InfiniteData<Page<PostResponse>> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((p) => (p.id === postId ? updater(p) : p)),
    })),
  };
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, PostResponse>({
    mutationFn: (post) =>
      post.likedByCurrentUser ? unlikePost(post.id) : likePost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const snapshot = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            likedByCurrentUser: !p.likedByCurrentUser,
            likeCount: p.likedByCurrentUser
              ? p.likeCount - 1
              : p.likeCount + 1,
          })),
      );

      return { snapshot };
    },

    onError: (_err, _post, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(["feed"], ctx.snapshot);
      }
    },

    onSuccess: (serverResponse, post) => {
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            likedByCurrentUser: serverResponse.likedByCurrentUser,
            likeCount: serverResponse.likeCount,
          })),
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostResponse>({
    mutationFn: (post) =>
      post.repostedByCurrentUser ? unrepostPost(post.id) : repostPost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const snapshot = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            repostedByCurrentUser: !p.repostedByCurrentUser,
            repostCount: p.repostedByCurrentUser
              ? p.repostCount - 1
              : p.repostCount + 1,
          })),
      );

      return { snapshot };
    },

    onError: (_err, _post, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(["feed"], ctx.snapshot);
      }
    },

    onSuccess: (serverResponse, post) => {
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            repostedByCurrentUser: serverResponse.repostedByCurrentUser,
            repostCount: serverResponse.repostCount,
          })),
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostResponse>({
    mutationFn: (post) =>
      post.favoritedByCurrentUser
        ? unfavoritePost(post.id)
        : favoritePost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["my-favorites"] });
      const snapshot = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            favoritedByCurrentUser: !p.favoritedByCurrentUser,
          })),
      );

      return { snapshot };
    },

    onError: (_err, _post, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(["feed"], ctx.snapshot);
      }
    },

    onSuccess: (serverResponse, post) => {
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            favoritedByCurrentUser: serverResponse.favoritedByCurrentUser,
          })),
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-favorites"] });
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, string>({
    mutationFn: (content) => createPost(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
