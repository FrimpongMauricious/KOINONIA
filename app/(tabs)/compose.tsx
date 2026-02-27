import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePrototypeStore } from "@/src/state/prototype-store";
import { usePrototypeSession } from "@/src/state/session";

const MAX_POST_LENGTH = 1000;

export default function ComposeScreen() {
  const [content, setContent] = useState("");
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const session = usePrototypeSession();
  const { createPost } = usePrototypeStore();

  const charactersLeft = useMemo(
    () => MAX_POST_LENGTH - content.length,
    [content],
  );

  const handlePublish = () => {
    const created = createPost(content);
    if (created) {
      setContent("");
    }
  };

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <ThemedView style={styles.inner}>
        <ThemedText type="title">Create Post</ThemedText>

        {session.isGuest ? (
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

            <Pressable
              style={[
                styles.button,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                },
              ]}
              onPress={handlePublish}
            >
              <ThemedText type="defaultSemiBold">
                Publish (prototype)
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
});
