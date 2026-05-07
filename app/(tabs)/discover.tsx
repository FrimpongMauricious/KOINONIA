import { StyleSheet, Text, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function DiscoverScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>
      <ThemedText style={styles.placeholder}>
        User search coming in the next update.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  placeholder: {
    marginTop: 40,
    textAlign: "center",
    paddingHorizontal: 16,
    color: "#71767B",
  },
});
