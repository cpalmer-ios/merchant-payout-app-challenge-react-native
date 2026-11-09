import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Currency } from '@/types/api';

const CURRENCIES = ['GBP', 'EUR'] as const satisfies readonly Currency[];

type CurrencyFieldProps = {
  readonly value: Currency;
  readonly onChange: (currency: Currency) => void;
};

export function CurrencyField({ value, onChange }: CurrencyFieldProps) {
  const [open, setOpen] = useState(false);
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const backdrop = useThemeColor({}, 'backdrop');
  const primary = useThemeColor({}, 'primary');

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">Currency</ThemedText>
      <Pressable
        accessibilityHint="Choose GBP or EUR"
        accessibilityLabel="Currency"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          setOpen(true);
        }}
        style={[styles.trigger, { backgroundColor: surface, borderColor: border }]}
        testID="currency-select">
        <ThemedText style={styles.triggerLabel}>{value}</ThemedText>
        <ThemedText lightColor={text} darkColor={text} style={styles.chevron}>
          ▾
        </ThemedText>
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
        }}
        transparent
        visible={open}>
        <Pressable
          accessibilityLabel="Dismiss currency list"
          onPress={() => {
            setOpen(false);
          }}
          style={[styles.backdrop, { backgroundColor: backdrop }]}>
          <View style={[styles.menu, { backgroundColor: surface }]}>
            {CURRENCIES.map((currency) => {
              const selected = currency === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={currency}
                  onPress={() => {
                    onChange(currency);
                    setOpen(false);
                  }}
                  style={styles.option}
                  testID={`currency-option-${currency}`}>
                  <ThemedText type="defaultSemiBold">{currency}</ThemedText>
                  {selected ? (
                    <ThemedText lightColor={primary} darkColor={primary}>
                      ✓
                    </ThemedText>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: 112,
    gap: 8,
  },
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  menu: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
