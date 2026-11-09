import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMinorUnits } from '@/lib/money';
import type { Currency } from '@/types/api';

type PayoutResultProps =
  | {
      readonly phase: 'submitting';
      readonly stage: 'biometrics' | 'network';
    }
  | {
      readonly phase: 'success';
      readonly amountMinor: number;
      readonly currency: Currency;
      readonly onCreateAnother: () => void;
    }
  | {
      readonly phase: 'failure';
      readonly message: string;
      readonly onTryAgain: () => void;
    };

export function PayoutResult(props: PayoutResultProps) {
  const negative = useThemeColor({}, 'negative');

  if (props.phase === 'submitting') {
    const label = props.stage === 'biometrics' ? 'Confirming your identity…' : 'Sending payout…';
    return (
      <View accessibilityLabel={label} accessibilityRole="progressbar" style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>{label}</ThemedText>
      </View>
    );
  }

  if (props.phase === 'success') {
    return (
      <View style={styles.centered}>
        <StatusMark kind="success" />
        <ThemedText type="subtitle">Payout Completed</ThemedText>
        <ThemedText style={styles.message}>
          Your payout of {formatMinorUnits(props.amountMinor, props.currency)} has been processed
          successfully.
        </ThemedText>
        <Button
          label="Create Another Payout"
          onPress={props.onCreateAnother}
          style={styles.action}
          testID="create-another"
        />
      </View>
    );
  }

  return (
    <View accessibilityRole="alert" style={styles.centered}>
      <StatusMark kind="failure" />
      <ThemedText lightColor={negative} darkColor={negative} type="subtitle" style={styles.failureTitle}>
        Unable to Process Payout
      </ThemedText>
      <ThemedText lightColor={negative} darkColor={negative} style={styles.message}>
        {props.message}
      </ThemedText>
      <Button label="Try Again" onPress={props.onTryAgain} style={styles.action} testID="try-again" />
    </View>
  );
}

function StatusMark({ kind }: { readonly kind: 'success' | 'failure' }) {
  const success = useThemeColor({}, 'success');
  const negative = useThemeColor({}, 'negative');
  const color = kind === 'success' ? success : negative;

  return (
    <View style={[styles.mark, { backgroundColor: kind === 'success' ? color : 'transparent' }]}>
      <ThemedText lightColor={kind === 'success' ? '#FFFFFF' : color} darkColor={kind === 'success' ? '#FFFFFF' : color} style={styles.markGlyph}>
        {kind === 'success' ? '✓' : '✕'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  failureTitle: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  markGlyph: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700',
  },
});
