import { Link } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/auth/auth-context";
import { deleteMyAccount } from "@/src/api/users";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user, status, logout } = useAuth();
  const isGuest = status !== "authenticated";

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(deletePassword);
      await logout();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setDeleteLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.profileImage,
          { borderColor: palette.border, backgroundColor: palette.surface },
        ]}
      >
        <AppLogo size={68} />
      </ThemedView>
      <ThemedText type="title">Profile</ThemedText>

      {isGuest ? (
        <>
          <ThemedText>You are browsing as a guest.</ThemedText>
          <Link href="/(auth)/login" asChild>
            <Pressable
              style={[
                styles.button,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
            >
              <ThemedText type="defaultSemiBold">Log in</ThemedText>
            </Pressable>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Pressable
              style={[
                styles.button,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
            >
              <ThemedText type="defaultSemiBold">Create account</ThemedText>
            </Pressable>
          </Link>
        </>
      ) : (
        <>
          <ThemedText type="subtitle">
            {user?.displayName ?? user?.username}
          </ThemedText>
          <ThemedText>@{user?.username}</ThemedText>
          {user?.bio ? <ThemedText>{user.bio}</ThemedText> : null}
          <ThemedText>
            {user?.followerCount ?? 0} followers ·{" "}
            {user?.followingCount ?? 0} following
          </ThemedText>

          <Link href="/edit-profile" asChild>
            <Pressable
              style={[
                styles.button,
                { borderColor: palette.border, backgroundColor: palette.surface },
              ]}
            >
              <ThemedText type="defaultSemiBold">Edit profile</ThemedText>
            </Pressable>
          </Link>

          <Pressable
            style={[styles.button, styles.logoutButton]}
            onPress={logout}
          >
            <ThemedText type="defaultSemiBold" style={styles.logoutText}>
              Log out
            </ThemedText>
          </Pressable>

          <Pressable onPress={() => setDeleteModalVisible(true)}>
            <ThemedText style={styles.deleteAccountText}>
              Delete account
            </ThemedText>
          </Pressable>
        </>
      )}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView
            style={[styles.modalCard, { borderColor: palette.border }]}
          >
            <ThemedText type="subtitle">Delete account</ThemedText>
            <ThemedText>
              This is permanent and cannot be undone. Enter your password to
              confirm.
            </ThemedText>

            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  color: palette.text,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={palette.icon}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            {deleteError ? (
              <ThemedText style={styles.errorText}>{deleteError}</ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.button,
                  { borderColor: palette.border, backgroundColor: palette.surface, flex: 1 },
                ]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
              >
                <ThemedText type="defaultSemiBold">Cancel</ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  styles.confirmDeleteButton,
                  (!deletePassword || deleteLoading) && styles.buttonDisabled,
                  { flex: 1 },
                ]}
                onPress={handleDeleteAccount}
                disabled={!deletePassword || deleteLoading}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.confirmDeleteText}
                >
                  {deleteLoading ? "Deleting…" : "Delete"}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutButton: {
    borderColor: "#c0392b",
    backgroundColor: "transparent",
    marginTop: 8,
  },
  logoutText: {
    color: "#c0392b",
  },
  deleteAccountText: {
    color: "#c0392b",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    backgroundColor: "white",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  confirmDeleteButton: {
    borderColor: "#c0392b",
    backgroundColor: "transparent",
  },
  confirmDeleteText: {
    color: "#c0392b",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: "#c0392b",
    fontSize: 13,
  },
});
