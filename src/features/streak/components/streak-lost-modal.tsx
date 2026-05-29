import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type StreakLostModalProps = {
  visible: boolean;
  lostStreakLength: number;
  onDismiss: () => void;
};

export function StreakLostModal({
  visible,
  lostStreakLength,
  onDismiss,
}: StreakLostModalProps) {
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
          <MaterialCommunityIcons name="heart-broken" size={120} color="#71767B" />

          <Text style={styles.streakNumber}>{lostStreakLength}</Text>
          <Text style={styles.streakLabel}>day streak lost</Text>

          <Text style={styles.encouragement}>
            Don't give up — every day is a new chance to grow in fellowship.
          </Text>

          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>START A NEW STREAK</Text>
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
    fontSize: 48,
    fontWeight: "bold",
    color: "#71767B",
    lineHeight: 56,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#71767B",
    marginBottom: 24,
  },
  encouragement: {
    color: "#E7E9EA",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
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
