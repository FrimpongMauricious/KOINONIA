/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const PURE_WHITE = "#FFFFFF";
const PURE_BLACK = "#000000";
const POWDER_BLUE = "#B0E0E6";

export const Colors = {
  light: {
    text: PURE_BLACK,
    background: PURE_WHITE,
    surface: PURE_WHITE,
    tint: POWDER_BLUE,
    icon: PURE_BLACK,
    border: POWDER_BLUE,
    tabIconDefault: "#6F7B82",
    tabIconSelected: PURE_BLACK,
  },
  dark: {
    text: PURE_BLACK,
    background: PURE_WHITE,
    surface: PURE_WHITE,
    tint: POWDER_BLUE,
    icon: PURE_BLACK,
    border: POWDER_BLUE,
    tabIconDefault: "#6F7B82",
    tabIconSelected: PURE_BLACK,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
