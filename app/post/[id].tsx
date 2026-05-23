import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { formatRelativeTime } from "@/src/utils/format";
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
import { CommentResponse } from "@/src/api/types";
import { PostCard } from "@/src/features/feed/components/post-card";
import { useComments } from "@/src/features/comments/hooks/use-comments";
import {
  useCreateComment,
  useDeleteComment,
} from "@/src/features/comments/hooks/use-comment-mutations";
import { useToggleCommentLike } from "@/src/features/comments/hooks/use-comment-like-mutations";
import { useReplies } from "@/src/features/comments/hooks/use-replies";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";

// ── Reply rows (no further nesting) ──────────────────────────────────────────

type ReplyRowProps = {
  reply: CommentResponse;
  currentUserId: number | undefined;
  onDelete: (id: number) => void;
  deleteIsPending: boolean;
  onToggleLike: (reply: CommentResponse) => void;
};

function ReplyRow({ reply, currentUserId, onDelete, deleteIsPending, onToggleLike }: ReplyRowProps) {
  const authorName = reply.author.displayName ?? reply.author.username;
  const initial = authorName.charAt(0).toUpperCase();
  const isOwn = reply.author.id === currentUserId;

  return (
    <View style={styles.replyRow}>
      {reply.author.profilePictureUrl ? (
        <Image
          source={{ uri: reply.author.profilePictureUrl }}
          style={styles.replyAvatar}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={styles.replyAvatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{authorName}</Text>
          <Text style={styles.commentUsername}> @{reply.author.username}</Text>
          <Text style={styles.commentTimestamp}> · {formatRelativeTime(reply.createdAt)}</Text>
          {isOwn ? (
            <Pressable
              onPress={() => onDelete(reply.id)}
              disabled={deleteIsPending}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.commentContent}>{reply.content}</Text>
        <View style={styles.actionRow}>
          <Pressable onPress={() => onToggleLike(reply)} style={styles.actionBtn} hitSlop={8}>
            <MaterialCommunityIcons
              name={reply.likedByCurrentUser ? "heart" : "heart-outline"}
              size={15}
              color={reply.likedByCurrentUser ? "#F4212E" : "#71767B"}
            />
            {reply.likeCount > 0 ? (
              <Text style={styles.actionCount}>{reply.likeCount}</Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Top-level comment row (with expandable replies) ───────────────────────────

type CommentItemProps = {
  comment: CommentResponse;
  postId: number;
  currentUserId: number | undefined;
  isGuest: boolean;
  onReply: (comment: CommentResponse) => void;
  onDelete: (id: number) => void;
  deleteIsPending: boolean;
  onToggleLike: (comment: CommentResponse) => void;
};

function CommentItem({
  comment,
  postId,
  currentUserId,
  isGuest,
  onReply,
  onDelete,
  deleteIsPending,
  onToggleLike,
}: CommentItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { replies, isLoading: repliesLoading } = useReplies(comment.id, expanded);
  const toggleReplyLike = useToggleCommentLike(postId);

  const authorName = comment.author.displayName ?? comment.author.username;
  const initial = authorName.charAt(0).toUpperCase();
  const isOwn = comment.author.id === currentUserId;

  return (
    <View>
      <View style={styles.commentRow}>
        {comment.author.profilePictureUrl ? (
          <Image
            source={{ uri: comment.author.profilePictureUrl }}
            style={styles.commentAvatar}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={styles.commentAvatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentName}>{authorName}</Text>
            <Text style={styles.commentUsername}> @{comment.author.username}</Text>
            <Text style={styles.commentTimestamp}> · {formatRelativeTime(comment.createdAt)}</Text>
            {isOwn ? (
              <Pressable
                onPress={() => onDelete(comment.id)}
                disabled={deleteIsPending}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.commentContent}>{comment.content}</Text>
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onToggleLike(comment)}
              style={styles.actionBtn}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={comment.likedByCurrentUser ? "heart" : "heart-outline"}
                size={15}
                color={comment.likedByCurrentUser ? "#F4212E" : "#71767B"}
              />
              {comment.likeCount > 0 ? (
                <Text style={styles.actionCount}>{comment.likeCount}</Text>
              ) : null}
            </Pressable>
            {!isGuest ? (
              <Pressable onPress={() => onReply(comment)} style={styles.actionBtn} hitSlop={8}>
                <Text style={styles.actionLabel}>Reply</Text>
              </Pressable>
            ) : null}
            {comment.replyCount > 0 ? (
              <Pressable
                onPress={() => setExpanded((v) => !v)}
                style={styles.actionBtn}
                hitSlop={8}
              >
                <Text style={styles.actionLabel}>
                  {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}{" "}
                  {expanded ? "▲" : "▼"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {expanded ? (
        <View style={styles.repliesContainer}>
          {repliesLoading ? (
            <ActivityIndicator size="small" color="#1D9BF0" style={styles.replyLoader} />
          ) : (
            replies.map((reply) => (
              <ReplyRow
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onDelete={onDelete}
                deleteIsPending={deleteIsPending}
                onToggleLike={(r) => toggleReplyLike.mutate(r)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = parseInt(id ?? "0", 10);
  const { user } = useAuth();
  const isGuest = !user;
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [commentDraft, setCommentDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);

  const { data: post, isLoading: postLoading, isError } = useQuery({
    queryKey: ["post", numericId],
    queryFn: () => fetchPostById(numericId),
    enabled: numericId > 0,
  });

  const { comments, isLoading: commentsLoading } = useComments(numericId);
  const createComment = useCreateComment(numericId);
  const deleteCommentMutation = useDeleteComment(numericId);
  const toggleCommentLike = useToggleCommentLike(numericId);
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  const handleSubmitComment = async () => {
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    try {
      await createComment.mutateAsync({
        content: trimmed,
        parentId: replyingTo?.id,
      });
      setCommentDraft("");
      setReplyingTo(null);
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                postId={numericId}
                currentUserId={user?.id}
                isGuest={isGuest}
                onReply={(c) => {
                  setReplyingTo(c);
                }}
                onDelete={(cid) => deleteCommentMutation.mutate(cid)}
                deleteIsPending={deleteCommentMutation.isPending}
                onToggleLike={(c) => toggleCommentLike.mutate(c)}
              />
            )}
          />

          {!isGuest ? (
            <View
              style={[
                styles.composerContainer,
                { backgroundColor: palette.background, borderTopColor: palette.border },
              ]}
            >
              {replyingTo ? (
                <View style={styles.replyingBanner}>
                  <Text style={styles.replyingText}>
                    Replying to{" "}
                    <Text style={styles.replyingHandle}>
                      @{replyingTo.author.username}
                    </Text>
                  </Text>
                  <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
                    <MaterialCommunityIcons name="close" size={16} color="#71767B" />
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.composerRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={
                    replyingTo
                      ? `Reply to @${replyingTo.author.username}…`
                      : "Write a comment…"
                  }
                  placeholderTextColor="#71767B"
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  maxLength={500}
                />
                <Pressable
                  style={[
                    styles.replyBtn,
                    (!commentDraft.trim() || createComment.isPending) &&
                      styles.btnDisabled,
                  ]}
                  onPress={handleSubmitComment}
                  disabled={!commentDraft.trim() || createComment.isPending}
                >
                  <Text style={styles.replyBtnText}>
                    {createComment.isPending ? "…" : "Reply"}
                  </Text>
                </Pressable>
              </View>
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
  // top-level comment
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
  // replies
  repliesContainer: {
    paddingLeft: 46,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  replyLoader: {
    paddingVertical: 8,
  },
  replyRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    paddingRight: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#2F3336",
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  // shared comment body
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
  },
  commentTimestamp: {
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
  // action row (like / reply / expand)
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    color: "#71767B",
    fontSize: 13,
  },
  actionLabel: {
    color: "#71767B",
    fontSize: 13,
  },
  // composer
  composerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  replyingText: {
    color: "#71767B",
    fontSize: 13,
  },
  replyingHandle: {
    color: "#1D9BF0",
  },
  composerRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
});
