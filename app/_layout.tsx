import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { PrototypeStoreProvider } from "@/src/state/prototype-store";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <PrototypeStoreProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
            <Stack.Screen name="user/[id]" options={{ title: "Creator" }} />
            <Stack.Screen
              name="edit-profile"
              options={{ title: "Edit Profile" }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Info" }}
            />
          </Stack>
        </PrototypeStoreProvider>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
