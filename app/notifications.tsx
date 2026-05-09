import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface Notification {
  id: string;
  type: "like" | "follow" | "comment" | "repost" | "favorite";
  username: string;
  displayName: string;
  initial: string;
  action: string;
  timestamp: string;
  unread?: boolean;
  relatedContent?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "like",
    username: "sarah_dev",
    displayName: "Sarah Developer",
    initial: "S",
    action: "liked your post",
    timestamp: "2 minutes ago",
    unread: true,
    relatedContent: "Your post about React hooks...",
  },
  {
    id: "2",
    type: "follow",
    username: "john_code",
    displayName: "John Code",
    initial: "J",
    action: "started following you",
    timestamp: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    type: "comment",
    username: "alice_dev",
    displayName: "Alice Dev",
    initial: "A",
    action: "replied to your post",
    timestamp: "3 hours ago",
    relatedContent: "Great article! Really helpful...",
  },
  {
    id: "4",
    type: "repost",
    username: "mike_tech",
    displayName: "Mike Tech",
    initial: "M",
    action: "reposted your post",
    timestamp: "5 hours ago",
  },
  {
    id: "5",
    type: "favorite",
    username: "emma_code",
    displayName: "Emma Code",
    initial: "E",
    action: "added your post to favorites",
    timestamp: "1 day ago",
  },
];

const NOTIFICATION_COLORS = {
  like: "#F91880",
  follow: "#1D9BF0",
  comment: "#00BA7C",
  repost: "#00BA7C",
  favorite: "#1D9BF0",
};

const NOTIFICATION_ICONS = {
  like: "heart.fill",
  follow: "person.badge.plus.fill",
  comment: "bubble.left.fill",
  repost: "arrow.2.squarepath",
  favorite: "bookmark.fill",
};

export default function NotificationsScreen() {
  const router = useRouter();

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable style={[styles.notificationItem, item.unread && styles.notificationUnread]}>
      <View style={styles.avatarSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: NOTIFICATION_COLORS[item.type] },
          ]}
        >
          <Text style={styles.avatarText}>{item.initial}</Text>
        </View>
        <View
          style={[
            styles.notificationBadge,
            { backgroundColor: NOTIFICATION_COLORS[item.type] },
          ]}
        >
          <IconSymbol
            size={12}
            name={NOTIFICATION_ICONS[item.type]}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {" "}
            @{item.username}
          </Text>
        </View>

        <Text style={styles.actionText}>{item.action}</Text>

        {item.relatedContent && (
          <Text style={styles.relatedContent} numberOfLines={2}>
            {item.relatedContent}
          </Text>
        )}

        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      {item.unread && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol size={24} name="chevron.left.forwardslash.chevron.right" color="#E7E9EA" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        scrollEnabled={true}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>
            No notifications yet. When someone interacts with your posts, you'll see it here.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
    backgroundColor: "#000000",
  },
  notificationUnread: {
    backgroundColor: "#0A0A0A",
  },
  avatarSection: {
    position: "relative",
    marginRight: 12,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  notificationBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  displayName: {
    color: "#E7E9EA",
    fontWeight: "700",
    fontSize: 15,
  },
  username: {
    color: "#71767B",
    fontSize: 14,
  },
  actionText: {
    color: "#E7E9EA",
    fontSize: 15,
    lineHeight: 20,
  },
  relatedContent: {
    color: "#71767B",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  timestamp: {
    color: "#71767B",
    fontSize: 13,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1D9BF0",
    marginLeft: 12,
    alignSelf: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 24,
    color: "#71767B",
    fontSize: 15,
  },
});
