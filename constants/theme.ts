import { Platform } from "react-native";

const TWITTER_BLUE = "#1D9BF0";
const TWITTER_TEXT = "#E7E9EA";
const TWITTER_MUTED = "#71767B";
const TWITTER_BG = "#000000";
const TWITTER_SURFACE = "#16181C";
const TWITTER_BORDER = "#2F3336";

const darkPalette = {
  text: TWITTER_TEXT,
  background: TWITTER_BG,
  surface: TWITTER_SURFACE,
  tint: TWITTER_BLUE,
  icon: TWITTER_MUTED,
  border: TWITTER_BORDER,
  tabIconDefault: TWITTER_MUTED,
  tabIconSelected: TWITTER_TEXT,
};

export const Colors = {
  light: darkPalette,
  dark: darkPalette,
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
