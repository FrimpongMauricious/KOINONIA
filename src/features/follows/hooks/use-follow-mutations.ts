import {
    InfiniteData,
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

type ToggleFollowVars = { targetUserId: number; currentlyFollowing: boolean };
type ToggleFollowContext = {
  feedSnapshot: unknown;
  favoritesSnapshot: unknown;
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

      const feedSnapshot = queryClient.getQueryData(["feed"]);
      const favoritesSnapshot = queryClient.getQueryData(["my-favorites"]);
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

      queryClient.setQueryData(["feed"], patchPostsInCache);
      queryClient.setQueryData(["my-favorites"], patchPostsInCache);

      const postQueriesData = queryClient.getQueriesData({
        queryKey: ["post"],
      });
      for (const [queryKey, data] of postQueriesData) {
        queryClient.setQueryData<PostResponse>(queryKey, (old) => {
          if (!old || old.author.id !== targetUserId) return old;
          return {
            ...old,
            author: { ...old.author, followedByCurrentUser: newFollowState },
          };
        });
      }

      const commentQueriesData = queryClient.getQueriesData({
        queryKey: ["comments"],
      });
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
        feedSnapshot,
        favoritesSnapshot,
        userSnapshot,
        meSnapshot,
        commentsSnapshots,
      };
    },

    onError: (_err, { targetUserId }, ctx) => {
      if (ctx?.feedSnapshot !== undefined) {
        queryClient.setQueryData(["feed"], ctx.feedSnapshot);
      }
      if (ctx?.favoritesSnapshot !== undefined) {
        queryClient.setQueryData(["my-favorites"], ctx.favoritesSnapshot);
      }
      if (ctx?.userSnapshot !== undefined) {
        queryClient.setQueryData(["user", targetUserId], ctx.userSnapshot);
      }
      if (ctx?.meSnapshot !== undefined) {
        queryClient.setQueryData(["me"], ctx.meSnapshot);
      }
      if (ctx?.commentsSnapshots) {
        for (const [queryKeyStr, snapshot] of ctx.commentsSnapshots) {
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData(queryKey, snapshot);
        }
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
