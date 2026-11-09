import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/screen-state';
import { ActivityListItem } from '@/components/merchant/activity-row';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useActivityFeed } from '@/hooks/use-activity-feed';
import type { ActivityItem } from '@/types/api';

type ActivityModalProps = {
  readonly onClose: () => void;
};

export function ActivityModal({ onClose }: ActivityModalProps) {
  const feed = useActivityFeed();
  const muted = useThemeColor({}, 'muted');
  const items = useMemo(() => uniqueById(feed.data?.pages.flatMap((page) => page.items) ?? []), [feed.data]);

  const loadMore = () => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      void feed.fetchNextPage();
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Recent Activity
        </ThemedText>
        <Button label="Done" onPress={onClose} variant="link" />
      </View>
      {feed.isPending ? <LoadingState label="Loading activity" /> : null}
      {feed.isError && items.length === 0 ? (
        <ErrorState
          title="Couldn't load activity"
          message="Check your connection and try again."
          onRetry={() => {
            void feed.refetch();
          }}
        />
      ) : null}
      {items.length === 0 && feed.isSuccess ? <EmptyState message="No recent activity yet." /> : null}
      {items.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => <ActivityListItem item={item} />}
          testID="activity-list"
          ListFooterComponent={
            <ActivityFooter
              hasError={feed.isFetchNextPageError}
              isLoading={feed.isFetchingNextPage}
              muted={muted}
              onRetry={() => {
                void feed.fetchNextPage();
              }}
            />
          }
        />
      ) : null}
    </Screen>
  );
}

function ActivityFooter({
  isLoading,
  hasError,
  muted,
  onRetry,
}: {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly muted: string;
  readonly onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <View accessibilityLabel="Loading more" style={styles.footer}>
        <ActivityIndicator />
        <ThemedText lightColor={muted} darkColor={muted}>
          Loading more...
        </ThemedText>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.footer}>
        <ThemedText>Could not load more activity.</ThemedText>
        <Button label="Retry" onPress={onRetry} variant="link" />
      </View>
    );
  }

  return null;
}

function uniqueById(items: readonly ActivityItem[]): ActivityItem[] {
  const seen = new Set<string>();
  const unique: ActivityItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
});
