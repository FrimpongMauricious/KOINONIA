import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type StreakCelebrationModalProps = {
  visible: boolean;
  currentStreak: number;
  userName: string;
  onDismiss: () => void;
};

export function StreakCelebrationModal({
  visible,
  currentStreak,
  userName,
  onDismiss,
}: StreakCelebrationModalProps) {
  // Convert JS day (0=Sun) to Mon-based index (Mon=0, Sun=6)
  const todayIndex = (new Date().getDay() + 6) % 7;
  const firstFilledDay = Math.max(0, todayIndex - currentStreak + 1);

  const alreadyFilled = Math.min(currentStreak, todayIndex + 1);
  const stillNeeded = 7 - alreadyFilled;
  const motivationalText =
    stillNeeded === 0
      ? "Perfect Week! 🎉"
      : `Post ${stillNeeded} more day${stillNeeded === 1 ? "" : "s"} for a Perfect Week!`;

  const displayName = userName.length > 0 ? userName : "Friend";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Flame */}
          <MaterialCommunityIcons name="fire" size={120} color="#FF9600" />

          {/* Streak count */}
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>

          {/* Weekly dots */}
          <View style={styles.weekRow}>
            {DAY_LABELS.map((label, i) => {
              const isActive = i >= firstFilledDay && i <= todayIndex;
              return (
                <View key={label} style={styles.dayCol}>
                  <View style={[styles.dot, isActive && styles.dotActive]}>
                    {isActive ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Motivational text */}
          <Text style={styles.motivationalText}>{motivationalText}</Text>

          {/* Dismiss */}
          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>
              NICE {displayName.toUpperCase()}! 🎉
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#FF9600",
    lineHeight: 80,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FF9600",
    marginBottom: 24,
  },
  weekRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2F3336",
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: "#FF9600",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  dayLabel: {
    color: "#71767B",
    fontSize: 11,
    fontWeight: "500",
  },
  dayLabelActive: {
    color: "#FF9600",
  },
  motivationalText: {
    color: "#E7E9EA",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  dismissBtn: {
    width: "100%",
    backgroundColor: "#1D9BF0",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  dismissText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
