import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ONBOARDING_KEY = "koinonia.onboarded";

const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

const store = Platform.OS === "web" ? webStorage : SecureStore;

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await store.getItemAsync(ONBOARDING_KEY);
  return value === "true";
}

export async function markOnboardingComplete(): Promise<void> {
  await store.setItemAsync(ONBOARDING_KEY, "true");
}
