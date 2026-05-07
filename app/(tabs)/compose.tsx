import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/auth/auth-context";
import { useCreatePost } from "@/src/features/feed/hooks/use-post-mutations";

const MAX_POST_LENGTH = 1000;

export default function ComposeScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { status } = useAuth();
  const isGuest = status !== "authenticated";
  const createPost = useCreatePost();

  const charactersLeft = useMemo(
    () => MAX_POST_LENGTH - content.length,
    [content],
  );

  const handlePublish = async () => {
    setErrorMessage(null);
    try {
      await createPost.mutateAsync(content.trim());
      setContent("");
      router.back();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <ThemedView style={styles.inner}>
        <ThemedText type="title">Create Post</ThemedText>

        {isGuest ? (
          <ThemedText>
            Guest users cannot create posts. Sign in to continue.
          </ThemedText>
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  color: palette.text,
                },
              ]}
              multiline
              maxLength={MAX_POST_LENGTH}
              placeholder="Share a scripture-based insight"
              placeholderTextColor={palette.icon}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />

            <ThemedText>{charactersLeft} characters left</ThemedText>

            {errorMessage ? (
              <ThemedText style={styles.error}>{errorMessage}</ThemedText>
            ) : null}

            <Pressable
              style={[
                styles.button,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
                createPost.isPending && styles.buttonDisabled,
              ]}
              onPress={handlePublish}
              disabled={createPost.isPending || !content.trim()}
            >
              <ThemedText type="defaultSemiBold">
                {createPost.isPending ? "Publishing…" : "Publish"}
              </ThemedText>
            </Pressable>
          </>
        )}
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
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
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
