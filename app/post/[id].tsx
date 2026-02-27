import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PostCard } from "@/src/features/feed/components/post-card";
import { mockUsers } from "@/src/mocks/users";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function PostDetailScreen() {
  const router = useRouter();
  const [commentDraft, setCommentDraft] = useState("");
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = usePrototypeSession();
  const {
    posts,
    commentsByPost,
    addComment,
    toggleFavorite,
    toggleLike,
    toggleRepost,
  } = usePrototypeStore();
  const post = posts.find((item) => item.id === id);
  const comments = post ? (commentsByPost[post.id] ?? []) : [];

  const handleSubmitComment = () => {
    if (!post) {
      return;
    }

    const trimmed = commentDraft.trim();
    if (!trimmed) {
      return;
    }

    addComment(post.id, trimmed);
    setCommentDraft("");
  };

  if (!post) {
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
          router.push({ pathname: "/user/[id]", params: { id: post.authorId } })
        }
        onToggleLike={() => toggleLike(post.id)}
        onAddComment={() => addComment(post.id)}
        onToggleRepost={() => toggleRepost(post.id)}
        onToggleFavorite={() => toggleFavorite(post.id)}
      />
      <ThemedText>
        This detail screen is currently powered by local mock data and will be
        wired to backend APIs later.
      </ThemedText>

      <ThemedView style={styles.commentComposerContainer}>
        <TextInput
          value={commentDraft}
          onChangeText={setCommentDraft}
          placeholder="Write your comment"
          placeholderTextColor={palette.tabIconDefault}
          style={[
            styles.commentInput,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              color: palette.text,
            },
          ]}
        />
        <Pressable
          onPress={handleSubmitComment}
          style={[
            styles.commentButton,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText type="defaultSemiBold">Add Comment</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedText type="subtitle">Comments ({comments.length})</ThemedText>
      {comments.length === 0 ? (
        <ThemedText>No comments yet. Write one above.</ThemedText>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const author = mockUsers.find((user) => user.id === item.authorId);

            return (
              <ThemedView style={styles.commentCard}>
                <ThemedText type="defaultSemiBold">
                  {author?.displayName ?? "User"}
                </ThemedText>
                <ThemedText>{item.content}</ThemedText>
              </ThemedView>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  commentsList: {
    gap: 8,
    paddingBottom: 24,
  },
  commentComposerContainer: {
    gap: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  commentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
});
