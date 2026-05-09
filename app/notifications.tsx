import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
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
import { NotificationResponse } from "@/src/api/types";
import { useAuth } from "@/src/auth/auth-context";
import { useMarkAllRead, useMarkRead } from "@/src/features/notifications/hooks/use-mark-read";
import { useNotifications } from "@/src/features/notifications/hooks/use-notifications";

function formatRelativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

function buildActionText(notification: NotificationResponse): string {
  const actorName = notification.actor.displayName ?? notification.actor.username;

  switch (notification.type) {
    case "LIKE":
      return `${actorName} liked your post`;
    case "COMMENT":
      return `${actorName} commented: "${notification.commentPreview ?? "..."}"`;
    case "REPOST":
      return `${actorName} reposted your post`;
    case "FOLLOW":
      return `${actorName} followed you`;
    default:
      return actorName;
  }
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: NotificationResponse;
  onOpen: (notification: NotificationResponse) => void;
}) {
  const markReadMutation = useMarkRead(notification.id);
  const actorName = notification.actor.displayName ?? notification.actor.username;
  const avatarInitial = actorName.charAt(0).toUpperCase();

  const handlePress = () => {
    if (notification.readAt === null) {
      markReadMutation.mutate();
    }
    onOpen(notification);
  };

  return (
    <Pressable
      style={[
        styles.notificationItem,
        notification.readAt === null && styles.notificationUnread,
      ]}
      onPress={handlePress}
    >
      <View style={styles.avatarSection}>
        {notification.actor.profilePictureUrl ? (
          <Image
            source={{ uri: notification.actor.profilePictureUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        )}
      </View>

      <View style={styles.contentSection}>
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>{buildActionText(notification)}</Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>

        {notification.post ? (
          <Text style={styles.previewText} numberOfLines={2}>
            {notification.post.contentPreview}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function InboxScreen() {
  const router = useRouter();
  const { status } = useAuth();
  const {
    notifications,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    isSuccess,
  } = useNotifications();
  const markAllReadMutation = useMarkAllRead();

  useEffect(() => {
    if (status === "authenticated" && isSuccess) {
      markAllReadMutation.mutate();
    }
  }, [isSuccess, status]);

  const handleOpen = (notification: NotificationResponse) => {
    if (notification.type === "FOLLOW") {
      router.push(`/user/${notification.actor.id}`);
      return;
    }

    if (notification.post) {
      router.push(`/post/${notification.post.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inbox</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#1D9BF0" />
        ) : null}

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onOpen={handleOpen} />
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No notifications yet — start following others or share a post to
              get the conversation going.
            </Text>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerSpinner} color="#1D9BF0" />
            ) : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  loader: {
    paddingVertical: 16,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
    backgroundColor: "#000000",
    gap: 12,
  },
  notificationUnread: {
    backgroundColor: "#0A101A",
  },
  avatarSection: {
    marginTop: 2,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  contentSection: {
    flex: 1,
    gap: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  actionText: {
    flex: 1,
    color: "#E7E9EA",
    fontSize: 14,
    lineHeight: 20,
  },
  previewText: {
    color: "#71767B",
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    color: "#71767B",
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: "#71767B",
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    lineHeight: 22,
  },
  footerSpinner: {
    paddingVertical: 16,
  },
});
