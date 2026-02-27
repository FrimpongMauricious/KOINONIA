import { Link } from "expo-router";
import { StyleSheet } from "react-native";

import { AppLogo } from "@/components/app-logo";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppLogo size={90} />
      <ThemedText type="title">Koinonia</ThemedText>
      <ThemedText>Christian Knowledge Sharing App</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Back to feed</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
