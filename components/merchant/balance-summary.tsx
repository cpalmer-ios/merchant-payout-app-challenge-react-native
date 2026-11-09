import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMinorUnits } from '@/lib/money';
import type { Currency } from '@/types/api';

type BalanceSummaryProps = {
  readonly availableMinor: number;
  readonly pendingMinor: number;
  readonly currency: Currency;
};

export function BalanceSummary({ availableMinor, pendingMinor, currency }: BalanceSummaryProps) {
  return (
    <View style={styles.row}>
      <BalanceFigure label="Available" minor={availableMinor} currency={currency} />
      <BalanceFigure label="Pending" minor={pendingMinor} currency={currency} />
    </View>
  );
}

function BalanceFigure({
  label,
  minor,
  currency,
}: {
  readonly label: string;
  readonly minor: number;
  readonly currency: Currency;
}) {
  const muted = useThemeColor({}, 'muted');
  const formatted = formatMinorUnits(minor, currency);

  return (
    <View accessible accessibilityLabel={`${label} balance ${formatted}`} style={styles.figure}>
      <ThemedText lightColor={muted} darkColor={muted}>
        {label}
      </ThemedText>
      <AmountText minor={minor} currency={currency} tone="neutral" size="title" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  figure: {
    flex: 1,
    gap: 4,
  },
});
