import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/auth/auth-context";
import { fetchPostById } from "@/src/api/posts";
import { PostCard } from "@/src/features/feed/components/post-card";
import { useComments } from "@/src/features/comments/hooks/use-comments";
import {
  useCreateComment,
  useDeleteComment,
} from "@/src/features/comments/hooks/use-comment-mutations";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user } = useAuth();
  const isGuest = !user;

  const [commentDraft, setCommentDraft] = useState("");

  const { data: post, isLoading: postLoading, isError } = useQuery({
    queryKey: ["post", numericId],
    queryFn: () => fetchPostById(numericId),
    enabled: numericId > 0,
  });

  const { comments, isLoading: commentsLoading } = useComments(numericId);
  const createComment = useCreateComment(numericId);
  const deleteCommentMutation = useDeleteComment(numericId);
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  const handleSubmitComment = async () => {
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    try {
      await createComment.mutateAsync(trimmed);
      setCommentDraft("");
    } catch {}
  };

  if (postLoading) {
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
        canLike={!isGuest}
        canFavorite={!isGuest}
        canRepost={!isGuest}
        onOpenAuthor={() =>
          router.push({
            pathname: "/user/[id]",
            params: { id: post.author.id.toString() },
          })
        }
        onToggleLike={() => toggleLike.mutate(post)}
        onAddComment={() => {}}
        onToggleRepost={() => toggleRepost.mutate(post)}
        onToggleFavorite={() => toggleFavorite.mutate(post)}
      />

      {!isGuest ? (
        <ThemedView style={styles.composerRow}>
          <TextInput
            style={[
              styles.commentInput,
              {
                borderColor: palette.border,
                backgroundColor: palette.surface,
                color: palette.text,
              },
            ]}
            placeholder="Write a comment…"
            placeholderTextColor={palette.icon}
            value={commentDraft}
            onChangeText={setCommentDraft}
            maxLength={500}
          />
          <Pressable
            style={[
              styles.replyButton,
              { borderColor: palette.border, backgroundColor: palette.surface },
              (!commentDraft.trim() || createComment.isPending) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentDraft.trim() || createComment.isPending}
          >
            <ThemedText type="defaultSemiBold">
              {createComment.isPending ? "…" : "Reply"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}

      <ThemedText type="subtitle">Comments ({comments.length})</ThemedText>

      {commentsLoading ? (
        <ActivityIndicator />
      ) : comments.length === 0 ? (
        <ThemedText style={styles.emptyText}>
          No comments yet — be the first to start the conversation.
        </ThemedText>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.commentsList}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const isOwn = item.author.id === user?.id;
            const authorName =
              item.author.displayName ?? item.author.username;
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <ThemedView
                style={[styles.commentCard, { borderColor: palette.border }]}
              >
                <View style={styles.commentHeader}>
                  <View
                    style={[
                      styles.commentAvatar,
                      {
                        borderColor: palette.border,
                        backgroundColor: palette.background,
                      },
                    ]}
                  >
                    <ThemedText type="defaultSemiBold">{initial}</ThemedText>
                  </View>
                  <View style={styles.commentMeta}>
                    <ThemedText type="defaultSemiBold">{authorName}</ThemedText>
                    <ThemedText>@{item.author.username}</ThemedText>
                  </View>
                  {isOwn ? (
                    <Pressable
                      onPress={() => deleteCommentMutation.mutate(item.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <ThemedText style={styles.deleteText}>Delete</ThemedText>
                    </Pressable>
                  ) : null}
                </View>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  composerRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  replyButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 4,
  },
  commentsList: {
    gap: 8,
    paddingBottom: 24,
  },
  commentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  commentMeta: {
    flex: 1,
  },
  deleteText: {
    color: "#c0392b",
    fontSize: 12,
  },
});
