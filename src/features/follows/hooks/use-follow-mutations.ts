import {
    InfiniteData,
    QueryKey,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { followUser, unfollowUser } from "@/src/api/follows";
import {
    CommentResponse,
    FollowResponse,
    Page,
    PostResponse,
    PublicUserProfileResponse,
} from "@/src/api/types";

type PostsSnapshot = [QueryKey, InfiniteData<Page<PostResponse>> | undefined][];

type ToggleFollowVars = { targetUserId: number; currentlyFollowing: boolean };
type ToggleFollowContext = {
  feedSnapshots: PostsSnapshot;
  userPostsSnapshots: PostsSnapshot;
  favoritesSnapshot: InfiniteData<Page<PostResponse>> | undefined;
  userSnapshot: unknown;
  meSnapshot: unknown;
  commentsSnapshots: Map<string, unknown>;
};

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation<
    FollowResponse,
    Error,
    ToggleFollowVars,
    ToggleFollowContext
  >({
    mutationFn: ({ targetUserId, currentlyFollowing }) =>
      currentlyFollowing
        ? unfollowUser(targetUserId)
        : followUser(targetUserId),

    onMutate: async ({ targetUserId, currentlyFollowing }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["my-favorites"] });
      await queryClient.cancelQueries({ queryKey: ["user", targetUserId] });
      await queryClient.cancelQueries({ queryKey: ["me"] });
      await queryClient.cancelQueries({ queryKey: ["user-posts"] });
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      await queryClient.cancelQueries({ queryKey: ["post"] });

      const feedSnapshots = queryClient.getQueriesData<InfiniteData<Page<PostResponse>>>({
        queryKey: ["feed"],
      });
      const userPostsSnapshots = queryClient.getQueriesData<InfiniteData<Page<PostResponse>>>({
        queryKey: ["user-posts"],
      });
      const favoritesSnapshot = queryClient.getQueryData<InfiniteData<Page<PostResponse>>>(
        ["my-favorites"],
      );
      const userSnapshot = queryClient.getQueryData(["user", targetUserId]);
      const meSnapshot = queryClient.getQueryData(["me"]);
      const commentsSnapshots = new Map<string, unknown>();

      const newFollowState = !currentlyFollowing;

      const patchPostsInCache = (
        old: InfiniteData<Page<PostResponse>> | undefined,
      ): InfiniteData<Page<PostResponse>> | undefined => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.map((post) =>
              post.author.id === targetUserId
                ? {
                    ...post,
                    author: {
                      ...post.author,
                      followedByCurrentUser: newFollowState,
                    },
                  }
                : post,
            ),
          })),
        };
      };

      // Patch all feed-prefixed caches (covers ["feed","all"], ["feed","FAITH"], etc.)
      for (const [key, old] of feedSnapshots) {
        queryClient.setQueryData(key, patchPostsInCache(old));
      }

      // Patch my-favorites (single exact key — no prefix issue)
      queryClient.setQueryData<InfiniteData<Page<PostResponse>>>(
        ["my-favorites"],
        patchPostsInCache,
      );

      // Patch all user-posts caches
      for (const [key, old] of userPostsSnapshots) {
        queryClient.setQueryData(key, patchPostsInCache(old));
      }

      // Patch all cached single-post entries whose author matches
      const postQueriesData = queryClient.getQueriesData({ queryKey: ["post"] });
      for (const [queryKey, data] of postQueriesData) {
        queryClient.setQueryData<PostResponse>(queryKey, (old) => {
          if (!old || old.author.id !== targetUserId) return old;
          return {
            ...old,
            author: { ...old.author, followedByCurrentUser: newFollowState },
          };
        });
      }

      // Patch all cached comment lists
      const commentQueriesData = queryClient.getQueriesData({ queryKey: ["comments"] });
      for (const [queryKey, data] of commentQueriesData) {
        commentsSnapshots.set(JSON.stringify(queryKey), data);
        queryClient.setQueryData<InfiniteData<Page<CommentResponse>>>(
          queryKey,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                content: page.content.map((comment) =>
                  comment.author.id === targetUserId
                    ? {
                        ...comment,
                        author: {
                          ...comment.author,
                          followedByCurrentUser: newFollowState,
                        },
                      }
                    : comment,
                ),
              })),
            };
          },
        );
      }

      queryClient.setQueryData<PublicUserProfileResponse>(
        ["user", targetUserId],
        (old) =>
          old
            ? {
                ...old,
                followedByCurrentUser: newFollowState,
                followerCount: currentlyFollowing
                  ? old.followerCount - 1
                  : old.followerCount + 1,
              }
            : old,
      );

      return {
        feedSnapshots,
        userPostsSnapshots,
        favoritesSnapshot,
        userSnapshot,
        meSnapshot,
        commentsSnapshots,
      };
    },

    onError: (_err, { targetUserId }, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.feedSnapshots) {
        queryClient.setQueryData(key, data);
      }
      for (const [key, data] of ctx.userPostsSnapshots) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(["my-favorites"], ctx.favoritesSnapshot);
      if (ctx.userSnapshot !== undefined) {
        queryClient.setQueryData(["user", targetUserId], ctx.userSnapshot);
      }
      if (ctx.meSnapshot !== undefined) {
        queryClient.setQueryData(["me"], ctx.meSnapshot);
      }
      for (const [queryKeyStr, snapshot] of ctx.commentsSnapshots) {
        queryClient.setQueryData(JSON.parse(queryKeyStr), snapshot);
      }
    },

    onSuccess: (serverResponse) => {
      queryClient.setQueryData<PublicUserProfileResponse>(
        ["user", serverResponse.userId],
        (old) =>
          old
            ? {
                ...old,
                followerCount: serverResponse.followerCount,
                followedByCurrentUser: serverResponse.followedByCurrentUser,
              }
            : old,
      );
    },
  });
}
