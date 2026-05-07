import { Link } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/auth/auth-context";
import { deleteMyAccount } from "@/src/api/users";

export default function ProfileScreen() {
  const { user, status, logout } = useAuth();
  const isGuest = status !== "authenticated";

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
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

  const displayName = user?.displayName ?? user?.username;
  const initial = displayName?.charAt(0).toUpperCase() ?? "?";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {isGuest ? (
        <View style={styles.guestSection}>
          <AppLogo size={72} />
          <ThemedText style={styles.guestText}>You are browsing as a guest.</ThemedText>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Log in</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>Create account</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
            {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <Text style={styles.stats}>
              {user?.followerCount ?? 0} followers · {user?.followingCount ?? 0} following
            </Text>
          </View>

          <View style={styles.actions}>
            <Link href="/edit-profile" asChild>
              <Pressable style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Edit profile</Text>
              </Pressable>
            </Link>

            <Pressable style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutBtnText}>Log out</Text>
            </Pressable>

            <Pressable onPress={() => setDeleteModalVisible(true)}>
              <Text style={styles.deleteLink}>Delete account</Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete account</Text>
            <Text style={styles.modalBody}>
              This is permanent and cannot be undone. Enter your password to confirm.
            </Text>

            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInputWithIcon}
                placeholder="Password"
                placeholderTextColor="#71767B"
                secureTextEntry={!showDeletePassword}
                value={deletePassword}
                onChangeText={setDeletePassword}
              />
              <Pressable
                onPress={() => setShowDeletePassword((v) => !v)}
                style={styles.eyeBtn}
              >
                <IconSymbol
                  size={20}
                  name={showDeletePassword ? "eye.slash" : "eye"}
                  color="#71767B"
                />
              </Pressable>
            </View>

            {deleteError ? (
              <Text style={styles.errorText}>{deleteError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.outlineBtn, { flex: 1 }]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletePassword("");
                  setDeleteError(null);
                  setShowDeletePassword(false);
                }}
                disabled={deleteLoading}
              >
                <Text style={styles.outlineBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.deleteConfirmBtn, { flex: 1 }, (!deletePassword || deleteLoading) && styles.btnDisabled]}
                onPress={handleDeleteAccount}
                disabled={!deletePassword || deleteLoading}
              >
                <Text style={styles.deleteConfirmText}>
                  {deleteLoading ? "Deleting…" : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2F3336",
  },
  headerTitle: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "800",
  },
  guestSection: {
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  guestText: {
    textAlign: "center",
  },
  profileSection: {
    padding: 20,
    gap: 6,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  displayName: {
    color: "#E7E9EA",
    fontSize: 20,
    fontWeight: "700",
  },
  username: {
    color: "#71767B",
    fontSize: 15,
  },
  bio: {
    color: "#E7E9EA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  stats: {
    color: "#71767B",
    fontSize: 14,
    marginTop: 6,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#536471",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineBtnText: {
    color: "#E7E9EA",
    fontWeight: "600",
    fontSize: 15,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#F4212E",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  logoutBtnText: {
    color: "#F4212E",
    fontWeight: "600",
    fontSize: 15,
  },
  deleteLink: {
    color: "#71767B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#16181C",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    color: "#E7E9EA",
    fontSize: 18,
    fontWeight: "700",
  },
  modalBody: {
    color: "#71767B",
    fontSize: 14,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#E7E9EA",
    fontSize: 15,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#2F3336",
    borderRadius: 8,
  },
  modalInputWithIcon: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#E7E9EA",
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  deleteConfirmBtn: {
    borderWidth: 1,
    borderColor: "#F4212E",
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteConfirmText: {
    color: "#F4212E",
    fontWeight: "600",
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  errorText: {
    color: "#F4212E",
    fontSize: 13,
  },
});
