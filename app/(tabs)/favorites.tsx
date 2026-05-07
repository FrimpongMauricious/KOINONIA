import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { useAuth } from "@/src/auth/auth-context";
import { useFavorites } from "@/src/features/favorites/hooks/use-favorites";

export default function FavoritesScreen() {
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
  } = useFavorites();

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {isGuest ? (
        <ThemedText style={styles.guestText}>
          Bookmarks are available for registered users only.
        </ThemedText>
      ) : isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#1D9BF0" />
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
              No bookmarks yet — tap the bookmark on any post.
            </ThemedText>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerSpinner} color="#1D9BF0" />
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              canLike={!isGuest}
              canFavorite={!isGuest}
              canRepost={!isGuest}
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
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  list: {
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
  },
  guestText: {
    paddingHorizontal: 16,
    marginTop: 24,
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
