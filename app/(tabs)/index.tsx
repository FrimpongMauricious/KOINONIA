import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { NotificationBell } from "@/components/notification-bell";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/src/auth/auth-context";
import { PostCard } from "@/src/features/feed/components/post-card";
import { useFeed } from "@/src/features/feed/hooks/use-feed";
import {
    useToggleFavorite,
    useToggleLike,
    useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { StreakBadge } from "@/src/features/streak/components/streak-badge";
import { useMyStreak } from "@/src/features/streak/hooks/use-streak";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const isGuest = status !== "authenticated";

  const {
    posts,
    isLoading,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  const { data: streakData } = useMyStreak();
  const currentStreak = streakData?.currentStreak ?? 0;

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Koinonia</Text>
            <NotificationBell />
            {isGuest ? <Text style={styles.guestBadge}>Guest</Text> : null}
          </View>
          {currentStreak >= 1 ? (
            <View style={styles.streakRow}>
              <StreakBadge streak={currentStreak} size="large" />
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#1D9BF0"
          />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching}
            onRefresh={refetch}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No posts yet — be the first to share something.
              </ThemedText>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  style={styles.footerSpinner}
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
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakRow: {
    paddingLeft: 2,
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
  },
  guestBadge: {
    color: "#71767B",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  list: {
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 16,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
