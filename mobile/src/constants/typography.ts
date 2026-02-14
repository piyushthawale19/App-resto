import { Platform } from "react-native";

// ─── Font Family ───
export const FontFamily = {
  regular: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  medium: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  semiBold: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  bold: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
};

// ─── Font Sizes ───
export const FontSize = {
  xxs: 10,
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  h4: 20,
  h3: 22,
  h2: 24,
  h1: 28,
  hero: 32,
};

// ─── Font Weights ───
export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semiBold: "600" as const,
  bold: "700" as const,
  extraBold: "800" as const,
};

// ─── Line Heights ───
export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

// ─── Text Presets ───
export const TextPreset = {
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.hero * LineHeight.tight,
  },
  h1: {
    fontSize: FontSize.h1,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.h1 * LineHeight.tight,
  },
  h2: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.h2 * LineHeight.tight,
  },
  h3: {
    fontSize: FontSize.h3,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.h3 * LineHeight.normal,
  },
  h4: {
    fontSize: FontSize.h4,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.h4 * LineHeight.normal,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  bodyBold: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  captionBold: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  small: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
  badge: {
    fontSize: FontSize.xxs,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xxs * LineHeight.normal,
  },
};

export default FontSize;
