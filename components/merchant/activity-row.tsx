import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AmountText } from '@/components/ui/amount-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { activityStatusLabel, activityTypeLabel } from '@/lib/activity';
import { formatActivityDate } from '@/lib/date';
import { formatMinorUnits } from '@/lib/money';
import type { ActivityItem } from '@/types/api';

export function RecentActivityRow({ item }: { readonly item: ActivityItem }) {
  const border = useThemeColor({}, 'border');
  const formatted = formatMinorUnits(item.amount, item.currency);

  return (
    <View
      accessible
      accessibilityLabel={`${item.description}, ${formatted}`}
      style={[styles.preview, { borderBottomColor: border }]}>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
      <AmountText minor={item.amount} currency={item.currency} />
    </View>
  );
}

export function ActivityListItem({ item }: { readonly item: ActivityItem }) {
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const formatted = formatMinorUnits(item.amount, item.currency);
  const date = formatActivityDate(item.date);
  const type = activityTypeLabel(item.type);
  const status = activityStatusLabel(item.status);

  return (
    <View
      accessible
      accessibilityLabel={`${type}, ${item.description}, ${date}, ${formatted}, ${status}`}
      style={[styles.detail, { borderBottomColor: border }]}>
      <View style={styles.main}>
        <ThemedText type="defaultSemiBold">{type}</ThemedText>
        <ThemedText>{item.description}</ThemedText>
        <ThemedText lightColor={muted} darkColor={muted} style={styles.meta}>
          {date}
        </ThemedText>
      </View>
      <View style={styles.side}>
        <AmountText minor={item.amount} currency={item.currency} />
        <ThemedText lightColor={muted} darkColor={muted} style={styles.meta}>
          {status}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  description: {
    flex: 1,
  },
  detail: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  side: {
    alignItems: 'flex-end',
    gap: 4,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
});
