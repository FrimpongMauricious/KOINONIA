import { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ScreenContainerProps {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
}

export function ScreenContainer({
  children,
  contentStyle,
  scroll = false,
  keyboardAvoiding = false,
}: ScreenContainerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const wrappedBody = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: palette.background }]}
      edges={["top", "left", "right", "bottom"]}
    >
      {wrappedBody}
    </SafeAreaView>
  );
}

const styles = {
  flex: {
    flex: 1,
  } as ViewStyle,
  content: {
    flexGrow: 1,
  } as ViewStyle,
};
