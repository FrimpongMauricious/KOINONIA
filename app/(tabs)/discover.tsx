import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/src/auth/auth-context";
import { Topic } from "@/src/api/types";
import { useFeed } from "@/src/features/feed/hooks/use-feed";
import { useUserSearch } from "@/src/features/users/hooks/use-user-search";
import { useTopics } from "@/src/features/topics/hooks/use-topics";
import { PostCard } from "@/src/features/feed/components/post-card";
import {
  useToggleFavorite,
  useToggleLike,
  useToggleRepost,
} from "@/src/features/feed/hooks/use-post-mutations";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DiscoverScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const isGuest = status !== "authenticated";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const { data: topicsData, isLoading: topicsLoading } = useTopics();
  const searchResults = useUserSearch(debouncedQuery);
  const feedResults = useFeed(selectedTopic === null ? undefined : selectedTopic);

  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleFavorite = useToggleFavorite();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 0;

  const topicEntries = topicsData?.topics ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#71767B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for users…"
              placeholderTextColor="#71767B"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => {
                  setQuery("");
                  setDebouncedQuery("");
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#71767B"
                />
              </Pressable>
            )}
          </View>
        </View>

        {isSearching ? (
          /* Search Results */
          searchResults.isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#1D9BF0"
            />
          ) : searchResults.data?.content.length === 0 ? (
            <ThemedText style={styles.emptyState}>
              No users found.
            </ThemedText>
          ) : (
            <FlatList
              data={searchResults.data?.content ?? []}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.userResult}
                  onPress={() =>
                    router.push({
                      pathname: "/user/[id]",
                      params: { id: item.id.toString() },
                    })
                  }
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(item.displayName ?? item.username)
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userDisplayName}>
                      {item.displayName ?? item.username}
                    </Text>
                    <Text style={styles.userUsername}>@{item.username}</Text>
                  </View>

                  <View style={styles.userFollowers}>
                    <Text style={styles.followerCount}>
                      {item.followerCount}
                    </Text>
                    <Text style={styles.followerLabel}>followers</Text>
                  </View>
                </Pressable>
              )}
            />
          )
        ) : (
          /* Topic View */
          <>
            {/* Topic chips */}
            {topicsLoading ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#1D9BF0"
              />
            ) : (
              <FlatList
                horizontal
                data={topicEntries}
                keyExtractor={(item) => item.topic}
                contentContainerStyle={styles.topicChipsContainer}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={() => (
                  <Pressable
                    style={[
                      styles.topicChip,
                      selectedTopic === null && styles.topicChipActive,
                    ]}
                    onPress={() => setSelectedTopic(null)}
                  >
                    <Text
                      style={[
                        styles.topicChipText,
                        selectedTopic === null && styles.topicChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </Pressable>
                )}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.topicChip,
                      selectedTopic === item.topic &&
                        styles.topicChipActive,
                    ]}
                    onPress={() => setSelectedTopic(item.topic)}
                  >
                    <Text
                      style={[
                        styles.topicChipText,
                        selectedTopic === item.topic &&
                          styles.topicChipTextActive,
                      ]}
                    >
                      {item.displayName} ({item.postCount})
                    </Text>
                  </Pressable>
                )}
              />
            )}

            {/* Filtered posts */}
            {feedResults.isLoading ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#1D9BF0"
              />
            ) : feedResults.posts.length === 0 ? (
              <ThemedText style={styles.emptyState}>
                No posts yet in this topic.
              </ThemedText>
            ) : (
              <FlatList
                data={feedResults.posts}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshing={feedResults.isRefetching}
                onRefresh={feedResults.refetch}
                onEndReached={() => {
                  if (feedResults.hasNextPage)
                    feedResults.fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  feedResults.isFetchingNextPage ? (
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
                    canRepost={!isGuest}
                    canFavorite={!isGuest}
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
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#E7E9EA",
    fontSize: 14,
  },
  topicChipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  topicChip: {
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topicChipActive: {
    backgroundColor: "#1D9BF0",
    borderColor: "#1D9BF0",
  },
  topicChipText: {
    color: "#71767B",
    fontSize: 13,
    fontWeight: "600",
  },
  topicChipTextActive: {
    color: "#FFFFFF",
  },
  list: {
    paddingBottom: 24,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 16,
    color: "#71767B",
  },
  footerSpinner: {
    paddingVertical: 16,
  },
  userResult: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userDisplayName: {
    color: "#E7E9EA",
    fontSize: 15,
    fontWeight: "600",
  },
  userUsername: {
    color: "#71767B",
    fontSize: 14,
  },
  userFollowers: {
    alignItems: "center",
  },
  followerCount: {
    color: "#E7E9EA",
    fontSize: 14,
    fontWeight: "600",
  },
  followerLabel: {
    color: "#71767B",
    fontSize: 12,
  },
});
