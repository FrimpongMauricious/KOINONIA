import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    FORCE_REGISTERED_TEST_MODE,
    usePrototypeStore,
} from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();
  const { activeUser } = usePrototypeStore();

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

      {FORCE_REGISTERED_TEST_MODE ? (
        <ThemedText>
          Testing mode enabled: registered-user features are unlocked.
        </ThemedText>
      ) : null}

      {session.isGuest ? (
        <>
          <ThemedText>You are browsing as a guest.</ThemedText>
          <Link href="/(auth)/login" asChild>
            <Pressable
              style={[
                styles.button,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">Log in</ThemedText>
            </Pressable>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Pressable
              style={[
                styles.button,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">Create account</ThemedText>
            </Pressable>
          </Link>
        </>
      ) : (
        <>
          <ThemedText type="subtitle">{activeUser?.displayName}</ThemedText>
          <ThemedText>@{activeUser?.handle}</ThemedText>
          <ThemedText>
            {activeUser?.followersCount ?? 0} followers ·{" "}
            {activeUser?.followingCount ?? 0} following
          </ThemedText>

          <Link href="/edit-profile" asChild>
            <Pressable
              style={[
                styles.button,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">Edit profile</ThemedText>
            </Pressable>
          </Link>
        </>
      )}
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
});
