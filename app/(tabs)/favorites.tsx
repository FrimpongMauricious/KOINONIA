import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/src/auth/auth-context";
import { useFavorites } from "@/src/features/favorites/hooks/use-favorites";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
    useToggleFavorite,
    useToggleLike,
    useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";

export default function FavoritesScreen() {
  const router = useRouter();
  const { isGuest, exitGuestMode } = useAuth();

  const {
    posts,
    isLoading,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFavorites();

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookmarks</Text>
        </View>

        {isGuest ? (
          <View style={styles.guestBody}>
            <Text style={styles.guestTitle}>Save your favourite posts</Text>
            <ThemedText style={styles.guestSub}>
              Sign up to bookmark posts and read them anytime.
            </ThemedText>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => { router.replace("/(auth)/register"); exitGuestMode(); }}
            >
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            </Pressable>
            <Pressable
              style={styles.outlineBtn}
              onPress={() => { router.replace("/(auth)/login"); exitGuestMode(); }}
            >
              <Text style={styles.outlineBtnText}>Log In</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#1D9BF0"
          />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching}
            onRefresh={refetch}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>
                No bookmarks yet — tap the bookmark on any post.
              </ThemedText>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  style={styles.footerSpinner}
                  color="#1D9BF0"
                />
              ) : null
            }
            renderItem={({ item }) => (
              <PostCard
                post={item}
                canLike={!isGuest}
                canFavorite={!isGuest}
                canRepost={!isGuest}
                onOpenAuthor={() =>
                  router.push({
                    pathname: "/user/[id]",
                    params: { id: item.author.id.toString() },
                  })
                }
                onToggleLike={() => toggleLike.mutate(item)}
                onAddComment={() => router.push(`/post/${item.id}`)}
                onToggleRepost={() => toggleRepost.mutate(item)}
                onToggleFavorite={() => toggleFavorite.mutate(item)}
                onOpen={() => router.push(`/post/${item.id}`)}
              />
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  list: {
    paddingBottom: 16,
  },
  loader: {
    flex: 1,
  },
  guestBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
  },
  guestTitle: {
    color: "#E7E9EA",
    fontSize: 22,
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
  primaryBtn: {
    width: "100%",
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  outlineBtnText: {
    color: "#E7E9EA",
    fontWeight: "600",
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 16,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
