import { fireEvent, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { HomeScreen } from '@/components/merchant/home-screen';
import { API_BASE_URL } from '@/constants';
import type { ActivityItem, MerchantDataResponse } from '@/types/api';
import { server } from '@/mocks/server.test';
import { renderWithQuery } from '@/test/render';

const merchantUrl = `${API_BASE_URL}/api/merchant`;

function activity(overrides: Partial<ActivityItem> & Pick<ActivityItem, 'id' | 'description' | 'amount' | 'date'>): ActivityItem {
  return {
    type: 'deposit',
    currency: 'GBP',
    status: 'completed',
    ...overrides,
  };
}

const merchant: MerchantDataResponse = {
  available_balance: 500_000,
  pending_balance: 25_000,
  currency: 'GBP',
  activity: [
    activity({
      id: 'old',
      description: 'Should not be in the preview',
      amount: -2_500,
      date: '2026-01-01T00:00:00.000Z',
      type: 'fee',
    }),
    activity({
      id: 'abc',
      description: 'Payment from Customer ABC',
      amount: 150_000,
      date: '2026-01-21T00:00:00.000Z',
    }),
    activity({
      id: 'riz',
      description: 'Payment from Customer RIZ',
      amount: 17_092,
      date: '2026-01-22T00:00:00.000Z',
    }),
    activity({
      id: 'qgw',
      description: 'Refund to Customer QGW',
      amount: -186_154,
      date: '2026-01-23T00:00:00.000Z',
      type: 'refund',
    }),
  ],
};

describe('HomeScreen', () => {
  it('shows balances and only the three most recent activity rows', async () => {
    server.use(
      http.get(merchantUrl, async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json(merchant);
      }),
    );
    const onShowMore = jest.fn();
    renderWithQuery(<HomeScreen onShowMore={onShowMore} />);

    expect(screen.getByText('Loading account')).toBeTruthy();
    expect(await screen.findByText('£5,000.00')).toBeTruthy();
    expect(screen.getByText('£250.00')).toBeTruthy();
    expect(screen.getByText('Refund to Customer QGW')).toBeTruthy();
    expect(screen.getByText('£-1,861.54')).toBeTruthy();
    expect(screen.getByText('Payment from Customer RIZ')).toBeTruthy();
    expect(screen.getByText('Payment from Customer ABC')).toBeTruthy();
    expect(screen.queryByText('Should not be in the preview')).toBeNull();
    expect(screen.queryByText('Refund')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Show More' }));
    expect(onShowMore).toHaveBeenCalledTimes(1);
  });

  it('lets the merchant retry after the account fails to load', async () => {
    let attempt = 0;
    server.use(
      http.get(merchantUrl, () => {
        attempt += 1;
        if (attempt === 1) {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
        return HttpResponse.json(merchant);
      }),
    );

    renderWithQuery(<HomeScreen onShowMore={jest.fn()} />);
    expect(await screen.findByText("Couldn't load account")).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('£5,000.00')).toBeTruthy();
  });

  it('shows an empty activity message when the account has no movements', async () => {
    server.use(
      http.get(merchantUrl, () =>
        HttpResponse.json({ ...merchant, activity: [] }),
      ),
    );

    renderWithQuery(<HomeScreen onShowMore={jest.fn()} />);
    expect(await screen.findByText('No recent activity yet.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show More' })).toBeTruthy();
  });
});
