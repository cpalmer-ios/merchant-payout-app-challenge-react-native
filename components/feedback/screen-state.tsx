import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function LoadingState({ label }: { readonly label: string }) {
  const muted = useThemeColor({}, 'muted');

  return (
    <View accessibilityLabel={label} accessibilityRole="progressbar" style={styles.centered}>
      <ActivityIndicator />
      <ThemedText lightColor={muted} darkColor={muted} style={styles.message}>
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  readonly title: string;
  readonly message: string;
  readonly onRetry: () => void;
}) {
  return (
    <View style={styles.centered}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      <Button label="Retry" onPress={onRetry} style={styles.action} />
    </View>
  );
}

export function EmptyState({ message }: { readonly message: string }) {
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.centered}>
      <ThemedText lightColor={muted} darkColor={muted} style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

export function Centered({ children }: { readonly children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
