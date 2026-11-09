import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorState, LoadingState } from '@/components/feedback/screen-state';
import { RecentActivityRow } from '@/components/merchant/activity-row';
import { BalanceSummary } from '@/components/merchant/balance-summary';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMerchant } from '@/hooks/use-merchant';
import { mostRecentActivity } from '@/lib/activity';

const PREVIEW_COUNT = 3;

type HomeScreenProps = {
  readonly onShowMore: () => void;
};

export function HomeScreen({ onShowMore }: HomeScreenProps) {
  const merchant = useMerchant();
  const tint = useThemeColor({}, 'tint');

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">Business Account</ThemedText>
      </View>
      {merchant.isPending ? <LoadingState label="Loading account" /> : null}
      {merchant.isError ? (
        <ErrorState
          title="Couldn't load account"
          message="Check your connection and try again."
          onRetry={() => {
            void merchant.refetch();
          }}
        />
      ) : null}
      {merchant.data ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={merchant.isRefetching}
              tintColor={tint}
              onRefresh={() => {
                void merchant.refetch();
              }}
            />
          }>
          <View style={styles.section}>
            <ThemedText type="subtitle">Account Balance</ThemedText>
            <BalanceSummary
              availableMinor={merchant.data.available_balance}
              currency={merchant.data.currency}
              pendingMinor={merchant.data.pending_balance}
            />
          </View>
          <View style={styles.section}>
            <ThemedText type="subtitle">Recent Activity</ThemedText>
            {merchant.data.activity.length === 0 ? (
              <ThemedText>No recent activity yet.</ThemedText>
            ) : (
              mostRecentActivity(merchant.data.activity, PREVIEW_COUNT).map((item) => (
                <RecentActivityRow key={item.id} item={item} />
              ))
            )}
            <Button label="Show More" onPress={onShowMore} style={styles.showMore} variant="soft" />
          </View>
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 28,
    gap: 12,
  },
  showMore: {
    marginTop: 16,
  },
});
