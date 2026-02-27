import { Link } from "expo-router";
import { Pressable, StyleSheet, TextInput } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RegisterScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <ScreenContainer scroll keyboardAvoiding contentStyle={styles.container}>
      <ThemedView style={styles.inner}>
        <AppLogo size={72} />
        <ThemedText type="title">Create Account</ThemedText>
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
          placeholder="Email"
          placeholderTextColor={palette.icon}
          autoCapitalize="none"
          keyboardType="email-address"
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
          placeholder="Password"
          placeholderTextColor={palette.icon}
          secureTextEntry
        />

        <Pressable
          style={[
            styles.button,
            { borderColor: palette.border, backgroundColor: palette.surface },
          ]}
        >
          <ThemedText type="defaultSemiBold">Create (prototype)</ThemedText>
        </Pressable>

        <Link href="/(auth)/login">
          <ThemedText>Already have an account?</ThemedText>
        </Link>
      </ThemedView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
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
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
});
