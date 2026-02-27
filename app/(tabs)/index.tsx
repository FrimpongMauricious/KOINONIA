import { useRouter } from "expo-router";
import { FlatList, StyleSheet } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PostCard } from "@/src/features/feed/components/post-card";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();
  const { posts, toggleLike, addComment, toggleRepost, toggleFavorite } =
    usePrototypeStore();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <AppLogo size={56} />
        <ThemedText type="title">Koinonia</ThemedText>
        <ThemedText>
          {session.isGuest ? "Guest Mode" : "Registered User"}
        </ThemedText>
      </ThemedView>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
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
                params: { id: item.authorId },
              })
            }
            onToggleLike={() => toggleLike(item.id)}
            onAddComment={() => addComment(item.id)}
            onToggleRepost={() => toggleRepost(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onOpen={() => router.push(`/post/${item.id}`)}
          />
        )}
      />

      <ThemedView
        style={[styles.footerNote, { borderTopColor: palette.border }]}
      >
        <ThemedText type="defaultSemiBold">Prototype Notes</ThemedText>
        <ThemedText>Feed is powered by local mock data for now.</ThemedText>
      </ThemedView>
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
  footerNote: {
    borderTopWidth: 1,
    paddingVertical: 10,
    gap: 2,
  },
});
