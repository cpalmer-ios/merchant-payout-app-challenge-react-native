/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0A7EA4';
const tintColorDark = '#7DD3EA';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    muted: '#6D6D72',
    border: '#E5E5EA',
    positive: '#1F8F4E',
    negative: '#E5484D',
    primary: tintColorLight,
    onPrimary: '#FFFFFF',
    disabled: '#E5E5EA',
    disabledText: '#8E8E93',
    secondary: '#E5E5EA',
    soft: '#E5F4FA',
    success: '#34C759',
    backdrop: 'rgba(17, 24, 28, 0.4)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    surface: '#1C1E21',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    muted: '#9BA1A6',
    border: '#2C2F33',
    positive: '#3DDC84',
    negative: '#FF6B6B',
    primary: '#0A7EA4',
    onPrimary: '#FFFFFF',
    disabled: '#2C2F33',
    disabledText: '#6D6D72',
    secondary: '#2C2F33',
    soft: '#16323A',
    success: '#34C759',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
