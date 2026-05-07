import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PostCard } from "@/src/features/feed/components/post-card";
import { useFeed } from "@/src/features/feed/hooks/use-feed";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { usePrototypeSession } from "@/src/state/session";

export default function HomeScreen() {
  const router = useRouter();
  const session = usePrototypeSession();

  const {
    posts,
    isLoading,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <AppLogo size={56} />
        <ThemedText type="title">Koinonia</ThemedText>
        <ThemedText>
          {session.isGuest ? "Guest Mode" : "Registered User"}
        </ThemedText>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" />
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
              <ActivityIndicator style={styles.footerSpinner} />
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              canLike={!session.isGuest}
              canRepost={!session.isGuest}
              canFavorite={!session.isGuest}
              onOpenAuthor={() =>
                router.push({
                  pathname: "/user/[id]",
                  params: { id: item.author.id.toString() },
                })
              }
              onToggleLike={() => toggleLike.mutate(item)}
              onAddComment={() =>
                console.log("TODO F1c: comments", item.id)
              }
              onToggleRepost={() => toggleRepost.mutate(item)}
              onToggleFavorite={() => toggleFavorite.mutate(item)}
              onOpen={() => router.push(`/post/${item.id}`)}
            />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    gap: 4,
    marginBottom: 12,
  },
  list: {
    gap: 10,
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
