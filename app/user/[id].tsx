import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PostCard } from "@/src/features/feed/components/post-card";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();

  const {
    users,
    posts,
    toggleFollow,
    toggleLike,
    addComment,
    toggleRepost,
    toggleFavorite,
  } = usePrototypeStore();

  const creator = users.find((user) => user.id === id);
  const creatorPosts = posts.filter((post) => post.authorId === id);
  const isFollowing = creator
    ? session.followingIds.includes(creator.id)
    : false;

  if (!creator) {
    return (
      <ScreenContainer contentStyle={styles.container}>
        <ThemedText>Creator not found.</ThemedText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.container}>
      <ThemedView style={[styles.headerCard, { borderColor: palette.border }]}>
        <View style={[styles.avatar, { borderColor: palette.border }]}>
          {creator.id === "u1" ? (
            <AppLogo size={34} />
          ) : (
            <ThemedText type="defaultSemiBold">
              {creator.displayName.charAt(0).toUpperCase()}
            </ThemedText>
          )}
        </View>

        <ThemedText type="title">{creator.displayName}</ThemedText>
        <ThemedText>@{creator.handle}</ThemedText>
        <ThemedText>
          {creator.followersCount} followers · {creator.followingCount}{" "}
          following
        </ThemedText>

        {creator.id !== session.activeUserId ? (
          <Pressable
            style={[styles.followButton, { borderColor: palette.border }]}
            onPress={() => toggleFollow(creator.id)}
          >
            <ThemedText type="defaultSemiBold">
              {isFollowing ? "Following" : "Follow"}
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>

      <ThemedText type="subtitle">Posts</ThemedText>
      <FlatList
        data={creatorPosts}
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
  followButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
});
