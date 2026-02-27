import { Pressable, StyleSheet, TextInput } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

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
        />
        <TextInput
          style={[
            styles.input,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              color: palette.text,
            },
          ]}
          placeholder="Bio"
          placeholderTextColor={palette.icon}
          multiline
        />
        <Pressable
          style={[
            styles.button,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText type="defaultSemiBold">Save (prototype)</ThemedText>
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
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
});
