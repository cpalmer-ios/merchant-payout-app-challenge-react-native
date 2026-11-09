import { StyleSheet, Text } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMinorUnits } from '@/lib/money';
import type { Currency } from '@/types/api';

type AmountTextProps = {
  readonly minor: number;
  readonly currency: Currency;
  readonly tone?: 'signed' | 'neutral';
  readonly size?: 'body' | 'title';
};

export function AmountText({ minor, currency, tone = 'signed', size = 'body' }: AmountTextProps) {
  const text = useThemeColor({}, 'text');
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');
  const formatted = formatMinorUnits(minor, currency);
  const color = tone === 'neutral' ? text : minor < 0 ? negative : positive;

  return (
    <Text
      accessibilityLabel={formatted}
      style={[
        styles.amount,
        size === 'title' ? styles.title : styles.body,
        { color },
      ]}>
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.4,
  },
});
