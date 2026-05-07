import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { useFavorites } from "@/src/features/favorites/hooks/use-favorites";
import { usePrototypeSession } from "@/src/state/session";

export default function FavoritesScreen() {
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
  } = useFavorites();

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Favorites</ThemedText>

      {session.isGuest ? (
        <ThemedText>
          Favorites are available for registered users only.
        </ThemedText>
      ) : isLoading ? (
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
              No favorites yet — tap the bookmark on any post.
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
              canFavorite={!session.isGuest}
              canRepost={!session.isGuest}
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
    padding: 16,
    gap: 10,
  },
  list: {
    gap: 10,
    paddingBottom: 20,
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
