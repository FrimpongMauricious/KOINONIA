import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 72 }: AppLogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/KOINONIA_image.jpg")}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
