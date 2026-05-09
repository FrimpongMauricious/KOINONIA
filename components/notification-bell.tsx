import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/auth/auth-context";
import { useUnreadCount } from "@/src/features/notifications/hooks/use-unread-count";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export function NotificationBell({ size = 26 }: { size?: number }) {
  const router = useRouter();
  const { status } = useAuth();
  const { count } = useUnreadCount(status === "authenticated");

  const badgeLabel = count > 9 ? "9+" : String(count);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];

  return (
    <Pressable
      onPress={() => router.push("/notifications")}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.wrap}
      accessibilityLabel={"Open notifications"}
    >
      <View style={styles.iconWrap}>
        <IconSymbol size={size} name="bell.slash.fill" color="#E7E9EA" />
        {count > 0 ? (
          <View style={[styles.badge, { backgroundColor: palette.tint }]}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 8,
    marginRight: 8,
    marginLeft: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
