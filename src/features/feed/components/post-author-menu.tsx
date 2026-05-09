import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { ThemedView } from "@/components/themed-view";

interface PostAuthorMenuProps {
  visible: boolean;
  authorUsername: string;
  onUnfollow: () => void;
  onClose: () => void;
}

export function PostAuthorMenu({
  visible,
  authorUsername,
  onUnfollow,
  onClose,
}: PostAuthorMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dimmed backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Bottom sheet */}
      <View style={styles.sheetContainer}>
        <ThemedView style={styles.sheet}>
          {/* Unfollow option (destructive) */}
          <Pressable style={styles.option} onPress={onUnfollow}>
            <Text style={styles.unfollowText}>Unfollow @{authorUsername}</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Cancel option */}
          <Pressable style={styles.option} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheetContainer: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  unfollowText: {
    color: "#E7547B",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelText: {
    color: "#1D9BF0",
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2F3336",
  },
});
