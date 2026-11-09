import { fireEvent, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { ActivityModal } from '@/components/merchant/activity-modal';
import { API_BASE_URL } from '@/constants';
import type { ActivityItem, PaginatedActivityResponse } from '@/types/api';
import { server } from '@/mocks/server.test';
import { renderWithQuery } from '@/test/render';

const activityUrl = `${API_BASE_URL}/api/merchant/activity`;

function activity(
  overrides: Partial<ActivityItem> & Pick<ActivityItem, 'id' | 'description' | 'amount'>,
): ActivityItem {
  return {
    type: 'deposit',
    currency: 'GBP',
    status: 'completed',
    date: '2026-01-23T00:00:00.000Z',
    ...overrides,
  };
}

function page(items: ActivityItem[], hasMore: boolean): PaginatedActivityResponse {
  const last = items[items.length - 1];
  return {
    items,
    next_cursor: hasMore && last ? last.id : null,
    has_more: hasMore,
  };
}

describe('ActivityModal', () => {
  it('lists type, description, amount, status, and a DD MM YYYY date', async () => {
    server.use(
      http.get(activityUrl, () =>
        HttpResponse.json(
          page(
            [
              activity({
                id: 'abc',
                type: 'deposit',
                description: 'Payment from Customer ABC',
                amount: 150_000,
                date: '2026-01-22T00:00:00.000Z',
              }),
              activity({
                id: 'fee',
                type: 'fee',
                description: 'Monthly service fee',
                amount: -2_500,
                date: '2026-01-23T00:00:00.000Z',
              }),
            ],
            false,
          ),
        ),
      ),
    );

    const onClose = jest.fn();
    renderWithQuery(<ActivityModal onClose={onClose} />);

    expect(await screen.findByText('Deposit')).toBeTruthy();
    expect(screen.getByText('Payment from Customer ABC')).toBeTruthy();
    expect(screen.getByText('£1,500.00')).toBeTruthy();
    expect(screen.getByText('22 01 2026')).toBeTruthy();
    expect(screen.getByText('Fee')).toBeTruthy();
    expect(screen.getByText('£-25.00')).toBeTruthy();
    expect(screen.getByText('23 01 2026')).toBeTruthy();
    expect(screen.getAllByText('Completed')).toHaveLength(2);

    fireEvent.press(screen.getByRole('button', { name: 'Done' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('loads the next cursor page when the list reaches the end', async () => {
    server.use(
      http.get(activityUrl, async ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        if (cursor) {
          await new Promise((resolve) => setTimeout(resolve, 80));
          return HttpResponse.json(
            page(
              [
                activity({
                  id: 'payout',
                  type: 'payout',
                  description: 'Payout to Bank Account ****1234',
                  amount: -50_000,
                  date: '2026-01-20T00:00:00.000Z',
                }),
              ],
              false,
            ),
          );
        }
        return HttpResponse.json(
          page(
            [
              activity({
                id: 'abc',
                description: 'Payment from Customer ABC',
                amount: 150_000,
              }),
            ],
            true,
          ),
        );
      }),
    );

    renderWithQuery(<ActivityModal onClose={jest.fn()} />);
    expect(await screen.findByText('Payment from Customer ABC')).toBeTruthy();

    fireEvent(screen.getByTestId('activity-list'), 'endReached');
    expect(await screen.findByText('Loading more...')).toBeTruthy();
    expect(await screen.findByText('Payout to Bank Account ****1234')).toBeTruthy();
    expect(screen.getByText('20 01 2026')).toBeTruthy();
  });

  it('keeps loaded activity on screen when the next page fails', async () => {
    server.use(
      http.get(activityUrl, ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor');
        if (cursor) {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
        return HttpResponse.json(
          page(
            [activity({ id: 'abc', description: 'Payment from Customer ABC', amount: 150_000 })],
            true,
          ),
        );
      }),
    );

    renderWithQuery(<ActivityModal onClose={jest.fn()} />);
    expect(await screen.findByText('Payment from Customer ABC')).toBeTruthy();

    fireEvent(screen.getByTestId('activity-list'), 'endReached');
    expect(await screen.findByText('Could not load more activity.')).toBeTruthy();
    expect(screen.getByText('Payment from Customer ABC')).toBeTruthy();
  });

  it('shows an error state when the first page fails', async () => {
    server.use(
      http.get(activityUrl, () => HttpResponse.json({ error: 'down' }, { status: 500 })),
    );

    renderWithQuery(<ActivityModal onClose={jest.fn()} />);
    expect(await screen.findByText("Couldn't load activity")).toBeTruthy();
  });
});
