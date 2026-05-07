import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/src/auth/auth-context";
import { useCreatePost } from "@/src/features/feed/hooks/use-post-mutations";

const MAX_POST_LENGTH = 1000;

export default function ComposeScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Post</Text>
      </View>

      {isGuest ? (
        <ThemedText style={styles.guestText}>
          Guest users cannot create posts. Sign in to continue.
        </ThemedText>
      ) : (
        <View style={styles.inner}>
          <TextInput
            style={styles.input}
            multiline
            maxLength={MAX_POST_LENGTH}
            placeholder="Share a scripture-based insight…"
            placeholderTextColor="#71767B"
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          <Text style={styles.charCount}>{charactersLeft} characters left</Text>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.publishBtn, (!content.trim() || createPost.isPending) && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={createPost.isPending || !content.trim()}
          >
            <Text style={styles.publishBtnText}>
              {createPost.isPending ? "Publishing…" : "Publish"}
            </Text>
          </Pressable>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  inner: {
    padding: 16,
    gap: 12,
  },
  guestText: {
    padding: 16,
  },
  input: {
    minHeight: 160,
    backgroundColor: "#16181C",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2F3336",
    borderRadius: 8,
    padding: 14,
    color: "#E7E9EA",
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    color: "#71767B",
    fontSize: 13,
    textAlign: "right",
  },
  publishBtn: {
    backgroundColor: "#1D9BF0",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  error: {
    color: "#F4212E",
    fontSize: 13,
  },
});
