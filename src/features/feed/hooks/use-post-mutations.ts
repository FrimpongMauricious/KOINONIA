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
import { CreatePostRequest, LikeResponse, Page, PostResponse } from "@/src/api/types";

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

function removeFavoritesPost(
  old: InfiniteData<Page<PostResponse>> | undefined,
  postId: number,
): InfiniteData<Page<PostResponse>> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.filter((p) => p.id !== postId),
    })),
  };
}

function addFavoritesPost(
  old: InfiniteData<Page<PostResponse>> | undefined,
  post: PostResponse,
): InfiniteData<Page<PostResponse>> | undefined {
  if (!old) return old;
  // Insert at top of first page; deduplicate in case it's already present
  return {
    ...old,
    pages: old.pages.map((page, i) =>
      i === 0
        ? {
            ...page,
            content: [
              post,
              ...page.content.filter((p) => p.id !== post.id),
            ],
          }
        : page,
    ),
  };
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, PostResponse, { snapshot: unknown }>({
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
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostResponse, { snapshot: unknown }>({
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
          patchFeedPost(old, post.id, () => serverResponse),
      );
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<
    PostResponse,
    Error,
    PostResponse,
    { feedSnapshot: unknown; favoritesSnapshot: unknown }
  >({
    mutationFn: (post) =>
      post.favoritedByCurrentUser
        ? unfavoritePost(post.id)
        : favoritePost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["my-favorites"] });

      const feedSnapshot = queryClient.getQueryData(["feed"]);
      const favoritesSnapshot = queryClient.getQueryData(["my-favorites"]);

      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, (p) => ({
            ...p,
            favoritedByCurrentUser: !p.favoritedByCurrentUser,
          })),
      );

      if (post.favoritedByCurrentUser) {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) => removeFavoritesPost(old, post.id),
        );
      } else {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) =>
            addFavoritesPost(old, { ...post, favoritedByCurrentUser: true }),
        );
      }

      return { feedSnapshot, favoritesSnapshot };
    },

    onError: (_err, _post, ctx) => {
      if (ctx?.feedSnapshot) {
        queryClient.setQueryData(["feed"], ctx.feedSnapshot);
      }
      if (ctx?.favoritesSnapshot) {
        queryClient.setQueryData(["my-favorites"], ctx.favoritesSnapshot);
      }
    },

    onSuccess: (serverResponse, post) => {
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["feed"],
        (old) =>
          patchFeedPost(old, post.id, () => serverResponse),
      );

      if (serverResponse.favoritedByCurrentUser) {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) => addFavoritesPost(old, serverResponse),
        );
      } else {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) => removeFavoritesPost(old, post.id),
        );
      }
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, CreatePostRequest>({
    mutationFn: (payload) => createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
