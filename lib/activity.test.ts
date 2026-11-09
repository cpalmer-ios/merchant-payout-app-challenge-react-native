import type { ActivityItem } from '@/types/api';

import { activityStatusLabel, activityTypeLabel, mostRecentActivity } from './activity';

function item(overrides: Partial<ActivityItem> & Pick<ActivityItem, 'id' | 'date'>): ActivityItem {
  return {
    type: 'deposit',
    amount: 100,
    currency: 'GBP',
    description: overrides.id,
    status: 'completed',
    ...overrides,
  };
}

describe('activity labels', () => {
  it('uses the words shown on the activity modal', () => {
    expect(activityTypeLabel('payout')).toBe('Payout');
    expect(activityTypeLabel('fee')).toBe('Fee');
    expect(activityStatusLabel('completed')).toBe('Completed');
    expect(activityStatusLabel('processing')).toBe('Processing');
  });
});

describe('mostRecentActivity', () => {
  it('returns the newest items first, limited to the requested count', () => {
    const items = [
      item({ id: 'old', date: '2026-01-01T00:00:00.000Z' }),
      item({ id: 'new', date: '2026-03-01T00:00:00.000Z' }),
      item({ id: 'mid', date: '2026-02-01T00:00:00.000Z' }),
    ];

    expect(mostRecentActivity(items, 2).map((entry) => entry.id)).toEqual(['new', 'mid']);
  });
});
