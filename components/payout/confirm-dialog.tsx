import { Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { maskIban } from '@/lib/iban';
import { formatMinorUnits } from '@/lib/money';
import type { Currency } from '@/types/api';

type ConfirmDialogProps = {
  readonly visible: boolean;
  readonly amountMinor: number;
  readonly currency: Currency;
  readonly iban: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  amountMinor,
  currency,
  iban,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const backdrop = useThemeColor({}, 'backdrop');

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: backdrop }]}>
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: surface }]}>
          <ThemedText type="subtitle" style={styles.title}>
            Confirm Payout
          </ThemedText>
          <SummaryRow border={border} label="Amount:" value={formatMinorUnits(amountMinor, currency)} />
          <SummaryRow border={border} label="Currency:" value={currency} />
          <SummaryRow border={border} label="IBAN:" value={maskIban(iban)} />
          <View style={styles.actions}>
            <Button
              label="Cancel"
              onPress={onCancel}
              style={styles.action}
              testID="cancel-payout"
              variant="secondary"
            />
            <Button label="Confirm" onPress={onConfirm} style={styles.action} testID="submit-payout" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({
  label,
  value,
  border,
}: {
  readonly label: string;
  readonly value: string;
  readonly border: string;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: border }]}>
      <ThemedText>{label}</ThemedText>
      <ThemedText style={styles.value} type="defaultSemiBold">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  action: {
    flex: 1,
  },
});
