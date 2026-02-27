import { useRouter } from "expo-router";
import { FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PostCard } from "@/src/features/feed/components/post-card";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function FavoritesScreen() {
  const router = useRouter();
  const session = usePrototypeSession();
  const { posts, addComment, toggleFavorite, toggleLike, toggleRepost } =
    usePrototypeStore();
  const favorites = posts.filter((post) =>
    post.favoriteBy.includes(session.activeUserId ?? ""),
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Favorites</ThemedText>

      {session.isGuest ? (
        <ThemedText>
          Favorites are available for registered users only.
        </ThemedText>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              canLike={!session.isGuest}
              canFavorite={!session.isGuest}
              canRepost={!session.isGuest}
              onOpenAuthor={() =>
                router.push({
                  pathname: "/user/[id]",
                  params: { id: item.authorId },
                })
              }
              onToggleLike={() => toggleLike(item.id)}
              onAddComment={() => addComment(item.id)}
              onToggleRepost={() => toggleRepost(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
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
});
