import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { PostCard } from "@/src/features/feed/components/post-card";
import { fetchPostById } from "@/src/api/posts";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { usePrototypeSession } from "@/src/state/session";

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const session = usePrototypeSession();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", numericId],
    queryFn: () => fetchPostById(numericId),
    enabled: numericId > 0,
  });

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  if (isLoading) {
    return (
      <ScreenContainer contentStyle={styles.centered} keyboardAvoiding>
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (isError || !post) {
    return (
      <ScreenContainer contentStyle={styles.container} keyboardAvoiding>
        <ThemedText>Post not found.</ThemedText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.container} keyboardAvoiding>
      <PostCard
        post={post}
        canLike={!session.isGuest}
        canFavorite={!session.isGuest}
        canRepost={!session.isGuest}
        onOpenAuthor={() =>
          router.push({
            pathname: "/user/[id]",
            params: { id: post.author.id.toString() },
          })
        }
        onToggleLike={() => toggleLike.mutate(post)}
        onAddComment={() => console.log("TODO F1c: comments", post.id)}
        onToggleRepost={() => toggleRepost.mutate(post)}
        onToggleFavorite={() => toggleFavorite.mutate(post)}
      />

      <ThemedText type="subtitle">Comments</ThemedText>
      <ThemedText style={styles.placeholder}>
        Comments coming in the next update.
      </ThemedText>
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
  placeholder: {
    marginTop: 8,
  },
});
