import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenProps = {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly edges?: 'top' | 'none';
};

export function Screen({ children, style, edges = 'top' }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const paddingTop = edges === 'top' ? Math.max(insets.top, 16) : 0;

  return <View style={[styles.screen, { backgroundColor, paddingTop }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
