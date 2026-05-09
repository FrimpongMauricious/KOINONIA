import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchUserPosts } from "@/src/api/users";
import { useAuth } from "@/src/auth/auth-context";
import { PostAuthorMenu } from "@/src/features/feed/components/post-author-menu";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
    useToggleFavorite,
    useToggleLike,
    useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { useToggleFollow } from "@/src/features/follows/hooks/use-follow-mutations";
import { useUserProfile } from "@/src/features/profile/hooks/use-user-profile";
import { formatCount } from "@/src/utils/format";

const BANNER_HEIGHT = 130;
const AVATAR_SIZE = 76;

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user;
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
  } = useUserProfile(numericId);

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
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#1D9BF0" />
      </ThemedView>
    );
  }

  if (isError || !profile) {
    return (
      <ThemedView style={styles.root}>
        <ThemedText style={styles.paddedText}>User not found.</ThemedText>
      </ThemedView>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const initial = displayName.charAt(0).toUpperCase();

  const profileHeader = (
    <View>
      {/* Blue banner */}
      <View style={styles.banner} />

      {/* Avatar row — overlaps banner */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

        {!isOwnProfile && !isGuest && !isFollowing ? (
          <Pressable
            style={styles.followBtn}
            onPress={() =>
              toggleFollow.mutate({
                targetUserId: numericId,
                currentlyFollowing: isFollowing,
              })
            }
            disabled={toggleFollow.isPending}
          >
            <Text style={styles.followBtnText}>Follow</Text>
          </Pressable>
        ) : null}

        {!isOwnProfile && !isGuest && isFollowing ? (
          <Pressable
            style={styles.menuBtn}
            onPress={() => setMenuVisible(true)}
            disabled={toggleFollow.isPending}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={20}
              color="#E7E9EA"
            />
          </Pressable>
        ) : null}
      </View>

      {/* Profile info */}
      <View style={styles.profileInfo}>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        {/* Stats row: bold numbers + muted labels */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {formatCount(profile.followingCount)}
            </Text>
            <Text style={styles.statLabel}> Following</Text>
          </View>
          <View style={[styles.statItem, { marginLeft: 18 }]}>
            <Text style={styles.statNumber}>
              {formatCount(profile.followerCount)}
            </Text>
            <Text style={styles.statLabel}> Followers</Text>
          </View>
          <View style={[styles.statItem, { marginLeft: 18 }]}>
            <Text style={styles.statNumber}>
              {formatCount(profile.totalLikes ?? 0)}
            </Text>
            <Text style={styles.statLabel}> Likes</Text>
          </View>
        </View>
      </View>

      {/* Posts tab indicator */}
      <View style={styles.tabBar}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>Posts</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ThemedView style={styles.root}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => profileHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (postsQuery.hasNextPage) postsQuery.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            postsQuery.isLoading ? (
              <ActivityIndicator style={styles.centerSpinner} color="#1D9BF0" />
            ) : (
              <Text style={styles.emptyText}>
                This creator has no posts yet.
              </Text>
            )
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <ActivityIndicator
                style={{ paddingVertical: 16 }}
                color="#1D9BF0"
              />
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

        <PostAuthorMenu
          visible={menuVisible}
          authorUsername={profile.username}
          onUnfollow={() => {
            toggleFollow.mutate({
              targetUserId: numericId,
              currentlyFollowing: isFollowing,
            });
            setMenuVisible(false);
          }}
          onClose={() => setMenuVisible(false)}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
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

  /* ── Banner & avatar ── */
  banner: {
    height: BANNER_HEIGHT,
    backgroundColor: "#1D9BF0",
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginTop: -(AVATAR_SIZE / 2),
    marginBottom: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#1D9BF0",
    borderWidth: 4,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },

  /* ── Follow button ── */
  followBtn: {
    backgroundColor: "#EFF3F4",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
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
  menuBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Profile info ── */
  profileInfo: {
    paddingHorizontal: 16,
    gap: 4,
  },
  displayName: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
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
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statNumber: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 15,
  },
  statLabel: {
    color: "#71767B",
    fontSize: 15,
  },

  /* ── Posts tab bar ── */
  tabBar: {
    flexDirection: "row",
    marginTop: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  activeTab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#1D9BF0",
    marginBottom: -StyleSheet.hairlineWidth,
  },
  activeTabText: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 15,
  },

  /* ── Feed states ── */
  centerSpinner: {
    marginTop: 32,
  },
  emptyText: {
    color: "#71767B",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
  },
});
