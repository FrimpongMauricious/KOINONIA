import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

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

// ── Per-page patch helper ─────────────────────────────────────────────────────

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
  return {
    ...old,
    pages: old.pages.map((page, i) =>
      i === 0
        ? {
            ...page,
            content: [post, ...page.content.filter((p) => p.id !== post.id)],
          }
        : page,
    ),
  };
}

// ── Multi-cache helpers ───────────────────────────────────────────────────────

type PostsSnapshot = [QueryKey, InfiniteData<Page<PostResponse>> | undefined][];

function snapshotCaches(queryClient: QueryClient, queryKey: unknown[]): PostsSnapshot {
  return queryClient.getQueriesData<InfiniteData<Page<PostResponse>>>({ queryKey });
}

function restoreSnapshot(queryClient: QueryClient, snapshot: PostsSnapshot) {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}

function patchAllFeedCaches(
  queryClient: QueryClient,
  postId: number,
  updater: (p: PostResponse) => PostResponse,
) {
  for (const [key, old] of snapshotCaches(queryClient, ["feed"])) {
    queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
      key,
      patchFeedPost(old, postId, updater),
    );
  }
}

function patchAllUserPostsCaches(
  queryClient: QueryClient,
  postId: number,
  updater: (p: PostResponse) => PostResponse,
) {
  for (const [key, old] of snapshotCaches(queryClient, ["user-posts"])) {
    queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
      key,
      patchFeedPost(old, postId, updater),
    );
  }
}

function patchSinglePostCache(
  queryClient: QueryClient,
  postId: number,
  updater: (p: PostResponse) => PostResponse,
) {
  queryClient.setQueryData<PostResponse>(
    ["post", postId],
    (old) => (old ? updater(old) : old),
  );
}

// ── Mutations ─────────────────────────────────────────────────────────────────

type PostMutationContext = {
  feedSnapshot: PostsSnapshot;
  userPostsSnapshot: PostsSnapshot;
  singlePostSnapshot: PostResponse | undefined;
};

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation<LikeResponse, Error, PostResponse, PostMutationContext>({
    mutationFn: (post) =>
      post.likedByCurrentUser ? unlikePost(post.id) : likePost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", post.id] });

      const feedSnapshot = snapshotCaches(queryClient, ["feed"]);
      const userPostsSnapshot = snapshotCaches(queryClient, ["user-posts"]);
      const singlePostSnapshot = queryClient.getQueryData<PostResponse>(["post", post.id]);

      const optimistic = (p: PostResponse): PostResponse => ({
        ...p,
        likedByCurrentUser: !p.likedByCurrentUser,
        likeCount: p.likedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1,
      });

      patchAllFeedCaches(queryClient, post.id, optimistic);
      patchAllUserPostsCaches(queryClient, post.id, optimistic);
      patchSinglePostCache(queryClient, post.id, optimistic);

      return { feedSnapshot, userPostsSnapshot, singlePostSnapshot };
    },

    onError: (_err, post, ctx) => {
      if (!ctx) return;
      restoreSnapshot(queryClient, ctx.feedSnapshot);
      restoreSnapshot(queryClient, ctx.userPostsSnapshot);
      queryClient.setQueryData(["post", post.id], ctx.singlePostSnapshot);
    },

    onSuccess: (serverResponse, post) => {
      const apply = (p: PostResponse): PostResponse => ({
        ...p,
        likedByCurrentUser: serverResponse.likedByCurrentUser,
        likeCount: serverResponse.likeCount,
      });
      patchAllFeedCaches(queryClient, post.id, apply);
      patchAllUserPostsCaches(queryClient, post.id, apply);
      patchSinglePostCache(queryClient, post.id, apply);
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostResponse, PostMutationContext>({
    mutationFn: (post) =>
      post.repostedByCurrentUser ? unrepostPost(post.id) : repostPost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", post.id] });

      const feedSnapshot = snapshotCaches(queryClient, ["feed"]);
      const userPostsSnapshot = snapshotCaches(queryClient, ["user-posts"]);
      const singlePostSnapshot = queryClient.getQueryData<PostResponse>(["post", post.id]);

      const optimistic = (p: PostResponse): PostResponse => ({
        ...p,
        repostedByCurrentUser: !p.repostedByCurrentUser,
        repostCount: p.repostedByCurrentUser ? p.repostCount - 1 : p.repostCount + 1,
      });

      patchAllFeedCaches(queryClient, post.id, optimistic);
      patchAllUserPostsCaches(queryClient, post.id, optimistic);
      patchSinglePostCache(queryClient, post.id, optimistic);

      return { feedSnapshot, userPostsSnapshot, singlePostSnapshot };
    },

    onError: (_err, post, ctx) => {
      if (!ctx) return;
      restoreSnapshot(queryClient, ctx.feedSnapshot);
      restoreSnapshot(queryClient, ctx.userPostsSnapshot);
      queryClient.setQueryData(["post", post.id], ctx.singlePostSnapshot);
    },

    onSuccess: (serverResponse, post) => {
      patchAllFeedCaches(queryClient, post.id, () => serverResponse);
      patchAllUserPostsCaches(queryClient, post.id, () => serverResponse);
      patchSinglePostCache(queryClient, post.id, () => serverResponse);
    },
  });
}

type FavoriteMutationContext = PostMutationContext & {
  favoritesSnapshot: InfiniteData<Page<PostResponse>> | undefined;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<PostResponse, Error, PostResponse, FavoriteMutationContext>({
    mutationFn: (post) =>
      post.favoritedByCurrentUser
        ? unfavoritePost(post.id)
        : favoritePost(post.id),

    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["my-favorites"] });
      await queryClient.cancelQueries({ queryKey: ["post", post.id] });

      const feedSnapshot = snapshotCaches(queryClient, ["feed"]);
      const userPostsSnapshot = snapshotCaches(queryClient, ["user-posts"]);
      const favoritesSnapshot = queryClient.getQueryData<InfiniteData<Page<PostResponse>>>(
        ["my-favorites"],
      );
      const singlePostSnapshot = queryClient.getQueryData<PostResponse>(["post", post.id]);

      const optimistic = (p: PostResponse): PostResponse => ({
        ...p,
        favoritedByCurrentUser: !p.favoritedByCurrentUser,
      });

      patchAllFeedCaches(queryClient, post.id, optimistic);
      patchAllUserPostsCaches(queryClient, post.id, optimistic);
      patchSinglePostCache(queryClient, post.id, optimistic);

      if (post.favoritedByCurrentUser) {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) => removeFavoritesPost(old, post.id),
        );
      } else {
        queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
          ["my-favorites"],
          (old) => addFavoritesPost(old, { ...post, favoritedByCurrentUser: true }),
        );
      }

      return { feedSnapshot, userPostsSnapshot, favoritesSnapshot, singlePostSnapshot };
    },

    onError: (_err, post, ctx) => {
      if (!ctx) return;
      restoreSnapshot(queryClient, ctx.feedSnapshot);
      restoreSnapshot(queryClient, ctx.userPostsSnapshot);
      queryClient.setQueryData(["my-favorites"], ctx.favoritesSnapshot);
      queryClient.setQueryData(["post", post.id], ctx.singlePostSnapshot);
    },

    onSuccess: (serverResponse, post) => {
      patchAllFeedCaches(queryClient, post.id, () => serverResponse);
      patchAllUserPostsCaches(queryClient, post.id, () => serverResponse);
      patchSinglePostCache(queryClient, post.id, () => serverResponse);

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
