import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'link';

type ButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly testID?: string;
  readonly style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  style,
}: ButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const onPrimary = useThemeColor({}, 'onPrimary');
  const disabledBackground = useThemeColor({}, 'disabled');
  const disabledText = useThemeColor({}, 'disabledText');
  const secondary = useThemeColor({}, 'secondary');
  const soft = useThemeColor({}, 'soft');
  const text = useThemeColor({}, 'text');
  const inactive = disabled || loading;
  const filled = variant !== 'link';

  const backgroundColor = backgroundFor(variant, inactive, {
    primary,
    secondary,
    disabledBackground,
    soft,
  });
  const labelColor = inactive && filled ? disabledText : labelColorFor(variant, { primary, onPrimary, text });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        filled ? styles.filled : styles.link,
        { backgroundColor, opacity: pressed && !inactive ? 0.85 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <ThemedText lightColor={labelColor} darkColor={labelColor} style={styles.label}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

function backgroundFor(
  variant: ButtonVariant,
  inactive: boolean,
  colors: { primary: string; secondary: string; disabledBackground: string; soft: string },
): string {
  if (variant === 'link') {
    return 'transparent';
  }
  if (inactive) {
    return colors.disabledBackground;
  }
  if (variant === 'primary') {
    return colors.primary;
  }
  if (variant === 'soft') {
    return colors.soft;
  }
  return colors.secondary;
}

function labelColorFor(
  variant: ButtonVariant,
  colors: { primary: string; onPrimary: string; text: string },
): string {
  if (variant === 'primary') {
    return colors.onPrimary;
  }
  if (variant === 'link' || variant === 'soft') {
    return colors.primary;
  }
  return colors.text;
}

const styles = StyleSheet.create({
  filled: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  link: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
  },
});
