import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { deleteMyAccount, fetchUserPosts } from "@/src/api/users";
import { useAuth } from "@/src/auth/auth-context";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
    useToggleFavorite,
    useToggleLike,
    useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { SafeAreaView } from "react-native-safe-area-context";

const BANNER_HEIGHT = 130;
const AVATAR_SIZE = 76;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const isGuest = status !== "authenticated";

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const postsQuery = useInfiniteQuery({
    queryKey: ["user-posts", user?.id ?? 0],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchUserPosts(user!.id, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: !!user?.id,
  });

  const posts = postsQuery.data?.pages.flatMap((p) => p.content) ?? [];
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(deletePassword);
      await logout();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setDeleteLoading(false);
    }
  };

  if (isGuest) {
    return (
      <ThemedView style={styles.root}>
        <View style={styles.guestBanner} />
        <View style={styles.guestBody}>
          <AppLogo size={72} />
          <Text style={styles.guestTitle}>Join Koinonia</Text>
          <Text style={styles.guestSub}>
            Sign in to share insights and connect with the community.
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Log in</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>Create account</Text>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
    );
  }

  const displayName = user?.displayName ?? user?.username ?? "";
  const initial = displayName.charAt(0).toUpperCase();

  const profileHeader = (
    <View>
      {/* Blue banner */}
      <View style={styles.banner} />

      {/* Avatar row — overlaps banner */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Link href="/edit-profile" asChild>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit profile</Text>
          </Pressable>
        </Link>
      </View>

      {/* Profile info */}
      <View style={styles.profileInfo}>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        {/* Stats row: bold numbers + muted labels */}
        <View style={styles.statsRow}>
          <Pressable style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.followingCount ?? 0}</Text>
            <Text style={styles.statLabel}> Following</Text>
          </Pressable>
          <Pressable style={[styles.statItem, { marginLeft: 18 }]}>
            <Text style={styles.statNumber}>{user?.followerCount ?? 0}</Text>
            <Text style={styles.statLabel}> Followers</Text>
          </Pressable>
        </View>

        {/* Secondary account actions */}
        <View style={styles.accountActions}>
          <Pressable onPress={logout}>
            <Text style={styles.secondaryLink}>Log out</Text>
          </Pressable>
          <Text style={styles.dot}>·</Text>
          <Pressable onPress={() => setDeleteModalVisible(true)}>
            <Text style={[styles.secondaryLink, { color: "#71767B" }]}>
              Delete account
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Posts tab indicator */}
      <View style={styles.tabBar}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>Posts</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ThemedView style={styles.root}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => profileHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (postsQuery.hasNextPage) postsQuery.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            postsQuery.isLoading ? (
              <ActivityIndicator style={styles.centerSpinner} color="#1D9BF0" />
            ) : (
              <Text style={styles.emptyText}>
                No posts yet — share your first insight.
              </Text>
            )
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <ActivityIndicator
                style={{ paddingVertical: 16 }}
                color="#1D9BF0"
              />
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              canLike
              canRepost
              canFavorite
              onOpenAuthor={() => {}}
              onToggleLike={() => toggleLike.mutate(item)}
              onAddComment={() => router.push(`/post/${item.id}`)}
              onToggleRepost={() => toggleRepost.mutate(item)}
              onToggleFavorite={() => toggleFavorite.mutate(item)}
              onOpen={() => router.push(`/post/${item.id}`)}
            />
          )}
        />

        {/* Delete account modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Delete account</Text>
              <Text style={styles.modalBody}>
                This is permanent and cannot be undone. Enter your password to
                confirm.
              </Text>

              <View style={styles.modalInputWrapper}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Password"
                  placeholderTextColor="#71767B"
                  secureTextEntry={!showDeletePassword}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                />
                <Pressable
                  onPress={() => setShowDeletePassword((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <IconSymbol
                    size={20}
                    name={showDeletePassword ? "eye.slash" : "eye"}
                    color="#71767B"
                  />
                </Pressable>
              </View>

              {deleteError ? (
                <Text style={styles.errorText}>{deleteError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.outlineBtn, { flex: 1 }]}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeletePassword("");
                    setDeleteError(null);
                    setShowDeletePassword(false);
                  }}
                  disabled={deleteLoading}
                >
                  <Text style={styles.outlineBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.deleteConfirmBtn,
                    { flex: 1 },
                    (!deletePassword || deleteLoading) && styles.btnDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={!deletePassword || deleteLoading}
                >
                  <Text style={styles.deleteConfirmText}>
                    {deleteLoading ? "Deleting…" : "Delete"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* ── Guest view ── */
  guestBanner: {
    height: 80,
    backgroundColor: "#16181C",
  },
  guestBody: {
    padding: 24,
    alignItems: "center",
    gap: 14,
  },
  guestTitle: {
    color: "#E7E9EA",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  guestSub: {
    color: "#71767B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 4,
  },

  /* ── Banner & avatar ── */
  banner: {
    height: BANNER_HEIGHT,
    backgroundColor: "#1D9BF0",
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginTop: -(AVATAR_SIZE / 2),
    marginBottom: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#1D9BF0",
    borderWidth: 4,
    borderColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },
  editBtn: {
    borderWidth: 1,
    borderColor: "#536471",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnText: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 14,
  },

  /* ── Profile info ── */
  profileInfo: {
    paddingHorizontal: 16,
    gap: 4,
  },
  displayName: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  username: {
    color: "#71767B",
    fontSize: 15,
  },
  bio: {
    color: "#E7E9EA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statNumber: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 15,
  },
  statLabel: {
    color: "#71767B",
    fontSize: 15,
  },

  /* ── Secondary actions (logout / delete) ── */
  accountActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  secondaryLink: {
    color: "#F4212E",
    fontSize: 13,
  },
  dot: {
    color: "#71767B",
    fontSize: 13,
  },

  /* ── Posts tab bar ── */
  tabBar: {
    flexDirection: "row",
    marginTop: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  activeTab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#1D9BF0",
    marginBottom: -StyleSheet.hairlineWidth,
  },
  activeTabText: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 15,
  },

  /* ── Feed states ── */
  centerSpinner: {
    marginTop: 32,
  },
  emptyText: {
    color: "#71767B",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
    paddingTop: 32,
  },

  /* ── Shared buttons ── */
  primaryBtn: {
    width: "100%",
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#536471",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineBtnText: {
    color: "#E7E9EA",
    fontWeight: "600",
    fontSize: 15,
  },

  /* ── Delete modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#16181C",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    color: "#E7E9EA",
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    color: "#71767B",
    fontSize: 14,
    lineHeight: 20,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 8,
  },
  modalInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#E7E9EA",
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  deleteConfirmBtn: {
    borderWidth: 1,
    borderColor: "#F4212E",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteConfirmText: {
    color: "#F4212E",
    fontWeight: "600",
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  errorText: {
    color: "#F4212E",
    fontSize: 13,
  },
});
