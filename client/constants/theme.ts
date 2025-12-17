import { Platform } from "react-native";

export const GameColors = {
  primary: "#1A4D2E",
  secondary: "#FF6500",
  background: "#0A0E27",
  surface: "#1C2541",
  textPrimary: "#F0F3FF",
  textSecondary: "#8D93AB",
  accent: "#FFD23F",
  danger: "#FF3B30",
  success: "#34C759",
};

export const Colors = {
  light: {
    text: GameColors.textPrimary,
    buttonText: "#FFFFFF",
    tabIconDefault: GameColors.textSecondary,
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: "#253253",
    backgroundTertiary: "#2E3D65",
  },
  dark: {
    text: GameColors.textPrimary,
    buttonText: "#FFFFFF",
    tabIconDefault: GameColors.textSecondary,
    tabIconSelected: GameColors.accent,
    link: GameColors.accent,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: "#253253",
    backgroundTertiary: "#2E3D65",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  mono: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
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

export const HUDStyles = {
  panelOpacity: 0.75,
  borderWidth: 2,
  controlSize: 60,
};
