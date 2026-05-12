import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { updateMyProfile } from "@/src/api/users";
import { useAuth } from "@/src/auth/auth-context";
import { useProfilePictureUpload } from "@/src/features/profile/hooks/use-profile-picture-upload";

const AVATAR_SIZE = 88;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const upload = useProfilePictureUpload();

  const displayedAvatarUri =
    upload.data?.profilePictureUrl ?? user?.profilePictureUrl ?? null;
  const avatarInitial = (user?.displayName ?? user?.username ?? "?")
    .charAt(0)
    .toUpperCase();

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant photo library access in Settings to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      upload.mutate(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
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
      setSaving(false);
    }
  };

  const isBusy = saving || upload.isPending;

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <View style={styles.inner}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Pressable
            onPress={handlePickAvatar}
            disabled={upload.isPending}
            style={styles.avatarWrapper}
          >
            {displayedAvatarUri ? (
              <Image
                source={{ uri: displayedAvatarUri }}
                style={styles.avatar}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
            )}
            {upload.isPending && (
              <View style={styles.avatarSpinner}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </Pressable>
          <Text style={styles.avatarCaption}>Tap to change</Text>
          {upload.isError && (
            <Text style={styles.error}>
              {upload.error instanceof Error
                ? upload.error.message
                : "Upload failed"}
            </Text>
          )}
        </View>

        {/* Form fields */}
        <Text style={styles.sectionLabel}>Display name</Text>
        <TextInput
          style={styles.input}
          placeholder="Display name"
          placeholderTextColor="#71767B"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!isBusy}
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
          editable={!isBusy}
        />

        {errorMessage ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.saveBtn, isBusy && styles.btnDisabled]}
          onPress={handleSave}
          disabled={isBusy}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving…" : "Save"}
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#1D9BF0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  avatarSpinner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCaption: {
    marginTop: 8,
    color: "#71767B",
    fontSize: 13,
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
    textAlign: "center",
  },
});
