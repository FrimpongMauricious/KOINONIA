import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
        <ActivityIndicator size="large" color="#1D9BF0" />
      </ScreenContainer>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenContainer contentStyle={styles.container}>
        <ThemedText style={styles.paddedText}>User not found.</ThemedText>
      </ScreenContainer>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScreenContainer contentStyle={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {!isOwnProfile && !isGuest ? (
            <Pressable
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={() =>
                toggleFollow.mutate({ userId: numericId, currentlyFollowing: isFollowing })
              }
              disabled={toggleFollow.isPending}
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        <Text style={styles.stats}>
          {profile.followerCount} followers · {profile.followingCount} following
        </Text>
      </View>

      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Posts</Text>
      </View>

      {postsQuery.isLoading ? (
        <ActivityIndicator style={styles.paddedText} color="#1D9BF0" />
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
            <ThemedText style={styles.emptyText}>This creator has no posts yet.</ThemedText>
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerSpinner} color="#1D9BF0" />
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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paddedText: {
    padding: 16,
  },
  profileHeader: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
  },
  displayName: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "700",
  },
  username: {
    color: "#71767B",
    fontSize: 15,
  },
  bio: {
    color: "#E7E9EA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  stats: {
    color: "#71767B",
    fontSize: 14,
    marginTop: 8,
  },
  followBtn: {
    backgroundColor: "#EFF3F4",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  followingBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#536471",
  },
  followBtnText: {
    color: "#0F1419",
    fontWeight: "700",
    fontSize: 14,
  },
  followingBtnText: {
    color: "#E7E9EA",
  },
  postsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  postsTitle: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 17,
  },
  list: {
    paddingBottom: 24,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 20,
    color: "#71767B",
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
