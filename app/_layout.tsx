import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as Notifications from "expo-notifications";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/auth/auth-context";
import { setupNotificationHandler } from "@/src/notifications/notification-setup";

setupNotificationHandler();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutInner() {
  const { status, hasOnboarded } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push("/(tabs)");
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const isLoggedInOrGuest = status === "authenticated" || status === "guest";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inAuthGroup = segments[0] === "(auth)";

    if (isLoggedInOrGuest && (inAuthGroup || inOnboardingGroup)) {
      router.replace("/(tabs)");
      return;
    }

    if (status === "unauthenticated" && !hasOnboarded && !inOnboardingGroup) {
      router.replace("/(onboarding)");
      return;
    }

    if (status === "unauthenticated" && hasOnboarded && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
  }, [status, hasOnboarded, segments]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
      <Stack.Screen name="user/[id]" options={{ title: "Creator" }} />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Info" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={DarkTheme}>
          <AuthProvider>
            <RootLayoutInner />
          </AuthProvider>
          <StatusBar style="light" backgroundColor="#000000" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
