import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PostCard } from "@/src/features/feed/components/post-card";
import { fetchUserPosts } from "@/src/api/users";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { usePrototypeSession } from "@/src/state/session";

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();

  const { data, isLoading } = useQuery({
    queryKey: ["user-posts", numericId],
    queryFn: () => fetchUserPosts(numericId),
    enabled: numericId > 0,
  });

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  const posts = data?.content ?? [];
  // Derive author info from the first post's nested AuthorRef
  const author = posts[0]?.author ?? null;
  const authorDisplayName = author
    ? (author.displayName ?? author.username)
    : null;

  if (isLoading) {
    return (
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.container}>
      <ThemedView style={[styles.headerCard, { borderColor: palette.border }]}>
        {author ? (
          <>
            <View style={[styles.avatar, { borderColor: palette.border }]}>
              <ThemedText type="defaultSemiBold">
                {(authorDisplayName ?? "U").charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="title">{authorDisplayName}</ThemedText>
            <ThemedText>@{author.username}</ThemedText>
            <ThemedText style={styles.profileNote}>
              Full profile coming in the next update.
            </ThemedText>
          </>
        ) : (
          <ThemedText>Creator not found.</ThemedText>
        )}
      </ThemedView>

      <ThemedText type="subtitle">Posts</ThemedText>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
        ListEmptyComponent={
          <ThemedText>This creator has no posts yet.</ThemedText>
        }
      />
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
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileNote: {
    marginTop: 4,
    opacity: 0.6,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
});
