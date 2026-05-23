import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
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
  const { user } = useAuth();
  const isGuest = !user;
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

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
      <ScreenContainer contentStyle={styles.centered}>
        <ActivityIndicator size="large" color="#1D9BF0" />
      </ScreenContainer>
    );
  }

  if (isError || !post) {
    return (
      <ScreenContainer>
        <ThemedText style={styles.paddedText}>Post not found.</ThemedText>
      </ScreenContainer>
    );
  }

  const renderComment = ({ item }: { item: (typeof comments)[number] }) => {
    const isOwn = item.author.id === user?.id;
    const authorName = item.author.displayName ?? item.author.username;
    const initial = authorName.charAt(0).toUpperCase();

    return (
      <View style={styles.commentRow}>
        {item.author.profilePictureUrl ? (
          <Image
            source={{ uri: item.author.profilePictureUrl }}
            style={styles.commentAvatar}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentName}>{authorName}</Text>
            <Text style={styles.commentUsername}> @{item.author.username}</Text>
            {isOwn ? (
              <Pressable
                onPress={() => deleteCommentMutation.mutate(item.id)}
                disabled={deleteCommentMutation.isPending}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
        </View>
      </View>
    );
  };

  const listHeader = (
    <>
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
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Replies ({comments.length})</Text>
      </View>
    </>
  );

  const listEmpty = commentsLoading ? (
    <ActivityIndicator style={styles.paddedText} color="#1D9BF0" />
  ) : (
    <ThemedText style={styles.emptyText}>
      No replies yet — be the first to start the conversation.
    </ThemedText>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <View style={styles.flex}>
          <FlatList
            style={styles.flex}
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.commentsList}
            renderItem={renderComment}
            keyboardShouldPersistTaps="handled"
          />
          {!isGuest ? (
            <View
              style={[
                styles.composerRow,
                { backgroundColor: palette.background, borderTopColor: palette.border },
              ]}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Post your reply…"
                placeholderTextColor="#71767B"
                value={commentDraft}
                onChangeText={setCommentDraft}
                maxLength={500}
              />
              <Pressable
                style={[
                  styles.replyBtn,
                  (!commentDraft.trim() || createComment.isPending) && styles.btnDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentDraft.trim() || createComment.isPending}
              >
                <Text style={styles.replyBtnText}>
                  {createComment.isPending ? "…" : "Reply"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paddedText: {
    padding: 16,
  },
  composerRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: "#E7E9EA",
    fontSize: 15,
  },
  replyBtn: {
    backgroundColor: "#1D9BF0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  replyBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  commentsTitle: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 17,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 20,
    color: "#71767B",
  },
  commentsList: {
    paddingBottom: 80,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  commentAvatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  commentName: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 14,
  },
  commentUsername: {
    color: "#71767B",
    fontSize: 13,
    flex: 1,
  },
  deleteBtn: {
    marginLeft: 8,
  },
  deleteText: {
    color: "#F4212E",
    fontSize: 12,
  },
  commentContent: {
    color: "#E7E9EA",
    fontSize: 15,
    lineHeight: 21,
  },
});
