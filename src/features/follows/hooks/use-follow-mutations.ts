import { useMutation, useQueryClient } from "@tanstack/react-query";

import { followUser, unfollowUser } from "@/src/api/follows";
import { FollowResponse, PublicUserProfileResponse } from "@/src/api/types";

type ToggleFollowVars = { userId: number; currentlyFollowing: boolean };
type ToggleFollowContext = { userSnapshot: unknown };

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation<FollowResponse, Error, ToggleFollowVars, ToggleFollowContext>({
    mutationFn: ({ userId, currentlyFollowing }) =>
      currentlyFollowing ? unfollowUser(userId) : followUser(userId),

    onMutate: async ({ userId, currentlyFollowing }) => {
      await queryClient.cancelQueries({ queryKey: ["user", userId] });
      const userSnapshot = queryClient.getQueryData(["user", userId]);

      queryClient.setQueryData<PublicUserProfileResponse>(
        ["user", userId],
        (old) =>
          old
            ? {
                ...old,
                followedByCurrentUser: !currentlyFollowing,
                followerCount: currentlyFollowing
                  ? old.followerCount - 1
                  : old.followerCount + 1,
              }
            : old,
      );

      return { userSnapshot };
    },

    onError: (_err, { userId }, ctx) => {
      if (ctx?.userSnapshot !== undefined) {
        queryClient.setQueryData(["user", userId], ctx.userSnapshot);
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
