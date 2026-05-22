import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { formatCount } from "@/src/utils/format";

interface StreakBadgeProps {
  streak: number;
  size?: "small" | "large";
}

export function StreakBadge({ streak, size = "small" }: StreakBadgeProps) {
  if (streak < 1) return null;

  if (size === "large") {
    return (
      <View style={styles.largeRow}>
        <MaterialCommunityIcons name="fire" size={20} color="#FF6B35" />
        <Text style={styles.largeNumber}>{formatCount(streak)}</Text>
        <Text style={styles.largeLabel}> day streak</Text>
      </View>
    );
  }

  return (
    <View style={styles.smallRow}>
      <MaterialCommunityIcons name="fire" size={15} color="#FF6B35" />
      <Text style={styles.smallNumber}>{formatCount(streak)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  largeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  largeNumber: {
    color: "#FF6B35",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 2,
  },
  largeLabel: {
    color: "#71767B",
    fontSize: 14,
  },
  smallRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  smallNumber: {
    color: "#FF6B35",
    fontWeight: "700",
    fontSize: 15,
  },
});
