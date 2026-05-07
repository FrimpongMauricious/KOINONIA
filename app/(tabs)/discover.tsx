import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function DiscoverScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Discover</ThemedText>
      <ThemedText style={styles.placeholder}>
        User search coming in the next update.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  placeholder: {
    marginTop: 24,
    textAlign: "center",
  },
});
