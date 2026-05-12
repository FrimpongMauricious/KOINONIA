import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/src/auth/auth-context";

interface GuestUpgradeModalProps {
  visible: boolean;
  action: string;
  onClose: () => void;
}

export function GuestUpgradeModal({
  visible,
  action,
  onClose,
}: GuestUpgradeModalProps) {
  const router = useRouter();
  const auth = useAuth();

  const handleSignUp = () => {
    onClose();
    router.replace("/(auth)/register");
    auth.exitGuestMode();
  };

  const handleLogIn = () => {
    onClose();
    router.replace("/(auth)/login");
    auth.exitGuestMode();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheetContainer}>
        <ThemedView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Sign up to {action}</Text>
            <Text style={styles.body}>
              Join Koinonia to fully participate — share posts, like, comment,
              and connect with fellow believers.
            </Text>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.primaryBtn} onPress={handleSignUp}>
            <Text style={styles.primaryBtnText}>Sign Up</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.option} onPress={handleLogIn}>
            <Text style={styles.logInText}>Log In</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.option} onPress={onClose}>
            <Text style={styles.cancelText}>Maybe later</Text>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  title: {
    color: "#E7E9EA",
    fontSize: 18,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  body: {
    color: "#71767B",
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#2F3336",
  },
  primaryBtn: {
    backgroundColor: "#1D9BF0",
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  logInText: {
    color: "#E7E9EA",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelText: {
    color: "#71767B",
    fontSize: 15,
  },
});
