import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/src/auth/auth-context";
import { updateMyProfile } from "@/src/api/users";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await updateMyProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      await refreshUser();
      router.back();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.sectionLabel}>Display name</Text>
        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#71767B"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.sectionLabel}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Bio"
          placeholderTextColor="#71767B"
          multiline
          textAlignVertical="top"
          value={bio}
          onChangeText={setBio}
        />

        {errorMessage ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.saveBtn, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  inner: {
    padding: 20,
    gap: 8,
  },
  sectionLabel: {
    color: "#71767B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 2,
  },
  input: {
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#E7E9EA",
    fontSize: 15,
    minHeight: 44,
  },
  bioInput: {
    minHeight: 100,
  },
  saveBtn: {
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  error: {
    color: "#F4212E",
    fontSize: 13,
  },
});
