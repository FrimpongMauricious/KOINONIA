import { formatCount } from "@/src/utils/format";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { PostResponse } from "@/src/api/types";
import { useAuth } from "@/src/auth/auth-context";
import { useToggleFollow } from "@/src/features/follows/hooks/use-follow-mutations";
import { PostAuthorMenu } from "./post-author-menu";

const LIKE_ACTIVE = "#F91880";
const REPOST_ACTIVE = "#00BA7C";
const FAVORITE_ACTIVE = "#1D9BF0";
const MUTED = "#71767B";
const TEXT = "#E7E9EA";
const BORDER = "#2F3336";
const AVATAR_BG = "#1D9BF0";

interface PostCardProps {
  post: PostResponse;
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
  const { user } = useAuth();

  const isLiked = post.likedByCurrentUser;
  const isReshared = post.repostedByCurrentUser;

  const authorDisplayName = post.author.displayName ?? post.author.username;
  const authorInitial = authorDisplayName.charAt(0).toUpperCase();
  const isOwnPost = user?.id === post.author.id;

  const toggleFollow = useToggleFollow();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleFollow = () => {
    toggleFollow.mutate({
      targetUserId: post.author.id,
      currentlyFollowing: post.author.followedByCurrentUser,
    });
  };

  const handleUnfollow = () => {
    handleFollow();
    setMenuVisible(false);
  };

  return (
    <>
      <Pressable onPress={onOpen} style={styles.card}>
        <View style={styles.row}>
          <Pressable
            onPress={onOpenAuthor}
            disabled={!onOpenAuthor}
            style={styles.avatarCol}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
          </Pressable>

          <View style={styles.contentCol}>
            <View style={styles.authorRow}>
              <Pressable
                onPress={onOpenAuthor}
                disabled={!onOpenAuthor}
                style={styles.authorInfo}
              >
                <Text style={styles.displayName} numberOfLines={1}>
                  {authorDisplayName}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                  {" "}
                  @{post.author.username}
                </Text>
              </Pressable>

              {!isOwnPost && user && !post.author.followedByCurrentUser ? (
                <Pressable
                  style={styles.followBtn}
                  onPress={handleFollow}
                  disabled={toggleFollow.isPending}
                >
                  <Text style={styles.followBtnText}>Follow</Text>
                </Pressable>
              ) : null}

              {!isOwnPost && user && post.author.followedByCurrentUser ? (
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => setMenuVisible(true)}
                  disabled={toggleFollow.isPending}
                >
                  <MaterialCommunityIcons
                    name="dots-horizontal"
                    size={20}
                    color={TEXT}
                  />
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.content}>{post.content}</Text>

            <View style={styles.actionsRow}>
              <Pressable onPress={onAddComment} style={styles.action}>
                <IconSymbol size={18} name="bubble.left" color={MUTED} />
                <Text style={styles.actionCount}>
                  {formatCount(post.commentCount)}
                </Text>
              </Pressable>

              <Pressable
                onPress={onToggleRepost}
                style={styles.action}
                disabled={!canRepost || !onToggleRepost}
              >
                <IconSymbol
                  size={18}
                  name="arrow.2.squarepath"
                  color={isReshared ? REPOST_ACTIVE : MUTED}
                />
                <Text
                  style={[
                    styles.actionCount,
                    isReshared && { color: REPOST_ACTIVE },
                  ]}
                >
                  {formatCount(post.repostCount)}
                </Text>
              </Pressable>

              <Pressable
                onPress={onToggleLike}
                style={styles.action}
                disabled={!canLike || !onToggleLike}
              >
                <IconSymbol
                  size={18}
                  name={isLiked ? "heart.fill" : "heart"}
                  color={isLiked ? LIKE_ACTIVE : MUTED}
                />
                <Text
                  style={[
                    styles.actionCount,
                    isLiked && { color: LIKE_ACTIVE },
                  ]}
                >
                  {formatCount(post.likeCount)}
                </Text>
              </Pressable>

              <Pressable
                onPress={onToggleFavorite}
                style={styles.action}
                disabled={!canFavorite || !onToggleFavorite}
              >
                <IconSymbol
                  size={18}
                  name={
                    post.favoritedByCurrentUser ? "bookmark.fill" : "bookmark"
                  }
                  color={post.favoritedByCurrentUser ? FAVORITE_ACTIVE : MUTED}
                />
              </Pressable>

              <View style={styles.action}>
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={18}
                  color={MUTED}
                />
                <Text style={styles.actionCount}>
                  {formatCount(post.viewCount ?? 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>

      <PostAuthorMenu
        visible={menuVisible}
        authorUsername={post.author.username}
        onUnfollow={handleUnfollow}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#000000",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  avatarCol: {},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: AVATAR_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  contentCol: {
    flex: 1,
    gap: 5,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
    flexWrap: "wrap",
  },
  displayName: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 15,
  },
  username: {
    color: MUTED,
    fontSize: 14,
  },
  followBtn: {
    backgroundColor: "#EFF3F4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  followingBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#536471",
  },
  followBtnText: {
    color: "#0F1419",
    fontWeight: "700",
    fontSize: 13,
  },
  followingBtnText: {
    color: TEXT,
  },
  menuBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 28,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    color: MUTED,
    fontSize: 13,
  },
});
