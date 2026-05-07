import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/auth/auth-context";
import { fetchUserPosts } from "@/src/api/users";
import { PostCard } from "@/src/features/feed/components/post-card";
import { useUserProfile } from "@/src/features/profile/hooks/use-user-profile";
import { useToggleFollow } from "@/src/features/follows/hooks/use-follow-mutations";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user } = useAuth();
  const isGuest = !user;

  const { data: profile, isLoading: profileLoading, isError } = useUserProfile(numericId);

  const postsQuery = useInfiniteQuery({
    queryKey: ["user-posts", numericId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchUserPosts(numericId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: numericId > 0,
  });

  const posts = postsQuery.data?.pages.flatMap((p) => p.content) ?? [];

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();
  const toggleFollow = useToggleFollow();

  const isOwnProfile = user?.id === numericId;
  const isFollowing = profile?.followedByCurrentUser ?? false;

  if (profileLoading) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenContainer contentStyle={styles.container}>
        <ThemedText>User not found.</ThemedText>
      </ScreenContainer>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScreenContainer contentStyle={styles.container}>
      <ThemedView style={[styles.headerCard, { borderColor: palette.border }]}>
        <View style={[styles.avatar, { borderColor: palette.border, backgroundColor: palette.background }]}>
          <ThemedText type="defaultSemiBold" style={styles.avatarInitial}>
            {initial}
          </ThemedText>
        </View>

        <ThemedText type="title">{displayName}</ThemedText>
        <ThemedText>@{profile.username}</ThemedText>
        {profile.bio ? <ThemedText>{profile.bio}</ThemedText> : null}
        <ThemedText>
          {profile.followerCount} followers · {profile.followingCount} following
        </ThemedText>

        {!isOwnProfile && !isGuest ? (
          <Pressable
            style={[styles.followButton, { borderColor: palette.border }]}
            onPress={() =>
              toggleFollow.mutate({ userId: numericId, currentlyFollowing: isFollowing })
            }
            disabled={toggleFollow.isPending}
          >
            <ThemedText type="defaultSemiBold">
              {isFollowing ? "Following" : "Follow"}
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>

      <ThemedText type="subtitle">Posts</ThemedText>

      {postsQuery.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (postsQuery.hasNextPage) postsQuery.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <ThemedText>This creator has no posts yet.</ThemedText>
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerSpinner} />
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              canLike={!isGuest}
              canRepost={!isGuest}
              canFavorite={!isGuest}
              onOpenAuthor={() =>
                router.push({
                  pathname: "/user/[id]",
                  params: { id: item.author.id.toString() },
                })
              }
              onToggleLike={() => toggleLike.mutate(item)}
              onAddComment={() => router.push(`/post/${item.id}`)}
              onToggleRepost={() => toggleRepost.mutate(item)}
              onToggleFavorite={() => toggleFavorite.mutate(item)}
              onOpen={() => router.push(`/post/${item.id}`)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    alignItems: "flex-start",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 22,
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
