import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();
  const { users, toggleFollow } = usePrototypeStore();

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return users;
    }

    return users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(normalized) ||
        user.handle.toLowerCase().includes(normalized),
    );
  }, [query, users]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Discover</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: palette.border,
            backgroundColor: palette.surface,
            color: palette.text,
          },
        ]}
        placeholder="Search believers"
        placeholderTextColor={palette.icon}
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ThemedView
            style={[
              styles.card,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
          >
            <ThemedText type="defaultSemiBold">{item.displayName}</ThemedText>
            <ThemedText>@{item.handle}</ThemedText>
            <ThemedText>
              {item.followersCount} followers · {item.followingCount} following
            </ThemedText>
            {item.id !== session.activeUserId ? (
              <Pressable
                style={[
                  styles.followButton,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.background,
                  },
                ]}
                onPress={() => toggleFollow(item.id)}
                disabled={session.isGuest}
              >
                <ThemedText>
                  {session.followingIds.includes(item.id)
                    ? "Unfollow"
                    : session.isGuest
                      ? "Login to follow"
                      : "Follow"}
                </ThemedText>
              </Pressable>
            ) : null}
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  list: {
    gap: 8,
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 2,
  },
  followButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
});
