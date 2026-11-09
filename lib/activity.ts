import type { ActivityItem, ActivityStatus, ActivityType } from '@/types/api';

const TYPE_LABELS: Record<ActivityType, string> = {
  deposit: 'Deposit',
  payout: 'Payout',
  refund: 'Refund',
  fee: 'Fee',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  failed: 'Failed',
};

export function activityTypeLabel(type: ActivityType): string {
  return TYPE_LABELS[type];
}

export function activityStatusLabel(status: ActivityStatus): string {
  return STATUS_LABELS[status];
}

export function mostRecentActivity(items: readonly ActivityItem[], count: number): ActivityItem[] {
  return [...items]
    .sort((left, right) => activityTime(right.date) - activityTime(left.date))
    .slice(0, count);
}

function activityTime(iso: string): number {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? 0 : time;
}
