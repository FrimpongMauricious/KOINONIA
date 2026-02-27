import { Pressable, StyleSheet, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";
import { Post } from "@/src/types/domain";

interface PostCardProps {
  post: Post;
  canRepost: boolean;
  canFavorite: boolean;
  canLike?: boolean;
  onOpen?: () => void;
  onOpenAuthor?: () => void;
  onToggleLike?: () => void;
  onAddComment?: () => void;
  onToggleRepost?: () => void;
  onToggleFavorite?: () => void;
}

export function PostCard({
  post,
  canRepost,
  canFavorite,
  canLike = true,
  onOpen,
  onOpenAuthor,
  onToggleLike,
  onAddComment,
  onToggleRepost,
  onToggleFavorite,
}: PostCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();
  const { users, toggleFollow } = usePrototypeStore();
  const author = users.find((user) => user.id === post.authorId);
  const activeUserId = session.activeUserId ?? "";

  const isLiked = post.likedBy.includes(activeUserId);
  const isReshared = post.repostedBy.includes(activeUserId);

  const likeActiveColor = "#D10000";
  const reshareDefaultColor = "#B0E0E6";
  const reshareActiveColor = "#8A0303";

  const likeColor = isLiked ? likeActiveColor : palette.icon;
  const reshareColor = isReshared ? reshareActiveColor : reshareDefaultColor;

  const canFollowAuthor = Boolean(author && author.id !== activeUserId);
  const isFollowingAuthor = author
    ? session.followingIds.includes(author.id)
    : false;

  return (
    <ThemedView
      style={[
        styles.card,
        { borderColor: palette.border, backgroundColor: palette.surface },
      ]}
    >
      <View style={styles.authorRow}>
        <Pressable
          onPress={onOpenAuthor}
          disabled={!onOpenAuthor}
          style={styles.authorIdentity}
        >
          <View
            style={[
              styles.avatar,
              {
                borderColor: palette.border,
                backgroundColor: palette.background,
              },
            ]}
          >
            {author?.id === "u1" ? (
              <AppLogo size={24} />
            ) : (
              <ThemedText type="defaultSemiBold">
                {(author?.displayName ?? "U").charAt(0).toUpperCase()}
              </ThemedText>
            )}
          </View>
          <View>
            <ThemedText type="defaultSemiBold">
              {author?.displayName ?? "Unknown author"}
            </ThemedText>
            <ThemedText>@{author?.handle ?? "unknown"}</ThemedText>
          </View>
        </Pressable>

        {canFollowAuthor ? (
          <Pressable
            style={[styles.followButton, { borderColor: palette.border }]}
            onPress={() => author && toggleFollow(author.id)}
          >
            <ThemedText type="defaultSemiBold">
              {isFollowingAuthor ? "Following" : "Follow"}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <ThemedText>{post.content}</ThemedText>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <IconSymbol size={16} name="heart.fill" color={likeColor} />
          <ThemedText>{post.likesCount}</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <IconSymbol size={16} name="bubble.left.fill" color={palette.icon} />
          <ThemedText>{post.commentsCount}</ThemedText>
        </View>
        <View style={styles.metricItem}>
          <IconSymbol
            size={16}
            name="arrow.2.squarepath"
            color={reshareColor}
          />
          <ThemedText>{post.repostsCount}</ThemedText>
        </View>
      </View>

      <ThemedView style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={onToggleLike}
          disabled={!canLike || !onToggleLike}
        >
          <View style={styles.buttonContent}>
            <IconSymbol size={16} name="heart.fill" color={likeColor} />
            <ThemedText lightColor={likeColor} darkColor={likeColor}>
              Like
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={onAddComment}
        >
          <View style={styles.buttonContent}>
            <IconSymbol
              size={16}
              name="bubble.left.fill"
              color={palette.icon}
            />
            <ThemedText>Comment +1</ThemedText>
          </View>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={onToggleRepost}
          disabled={!canRepost || !onToggleRepost}
        >
          <View style={styles.buttonContent}>
            <IconSymbol
              size={16}
              name="arrow.2.squarepath"
              color={reshareColor}
            />
            <ThemedText lightColor={reshareColor} darkColor={reshareColor}>
              {canRepost ? "Repost" : "Login to repost"}
            </ThemedText>
          </View>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={onToggleFavorite}
          disabled={!canFavorite || !onToggleFavorite}
        >
          <View style={styles.buttonContent}>
            <IconSymbol size={16} name="bookmark.fill" color={palette.icon} />
            <ThemedText>
              {canFavorite ? "Favorite" : "Login to favorite"}
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { borderColor: palette.border }]}
          onPress={onOpen}
          disabled={!onOpen}
        >
          <View style={styles.buttonContent}>
            <IconSymbol
              size={16}
              name="arrow.up.right.square"
              color={palette.icon}
            />
            <ThemedText>Open</ThemedText>
          </View>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 5,
  },
  authorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  authorIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  followButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
