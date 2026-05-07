import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/auth/auth-context";
import { updateMyProfile } from "@/src/api/users";

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
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
      <ThemedView style={styles.inner}>
        <ThemedText type="title">Edit Profile</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              color: palette.text,
            },
          ]}
          placeholder="Display name"
          placeholderTextColor={palette.icon}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={[
            styles.input,
            styles.bioInput,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              color: palette.text,
            },
          ]}
          placeholder="Bio"
          placeholderTextColor={palette.icon}
          multiline
          textAlignVertical="top"
          value={bio}
          onChangeText={setBio}
        />

        {errorMessage ? (
          <ThemedText style={styles.error}>{errorMessage}</ThemedText>
        ) : null}

        <Pressable
          style={[
            styles.button,
            { borderColor: palette.border, backgroundColor: palette.surface },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <ThemedText type="defaultSemiBold">
            {loading ? "Saving…" : "Save"}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  inner: {
    padding: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  bioInput: {
    minHeight: 100,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  error: {
    color: "#c0392b",
    fontSize: 13,
  },
});
