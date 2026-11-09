import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/server.test';

import { ApiError } from './errors';
import { getActivityPage, getMerchant } from './merchant';
import { createPayout } from './payouts';

const payoutUrl = `${API_BASE_URL}/api/payouts`;

describe('createPayout', () => {
  it('sends minor units and returns a completed payout', async () => {
    const payout = await createPayout({
      amount: 40_000,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
      device_id: 'device-1',
    });

    expect(payout.status).toBe('completed');
    expect(payout.amount).toBe(40_000);
    expect(payout.currency).toBe('GBP');
  });

  it('maps the 888.88 insufficient-funds trigger', async () => {
    const error = await createPayout({
      amount: 88_888,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'insufficient_funds', status: 400 });
  });

  it('maps the 999.99 service-unavailable trigger', async () => {
    const error = await createPayout({
      amount: 99_999,
      currency: 'EUR',
      iban: 'GB29NWBK60161331926819',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'unavailable', status: 503 });
  });

  it('treats a completed HTTP response with a failed payout status as a failure', async () => {
    const error = await createPayout({
      amount: 199,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'payout_failed' });
  });

  it('reports a network failure without a status code', async () => {
    server.use(http.post(payoutUrl, () => HttpResponse.error()));

    const error = await createPayout({
      amount: 100,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'network', status: 0 });
  });

  it('rejects a response that does not match the payout contract', async () => {
    server.use(http.post(payoutUrl, () => HttpResponse.json({ id: 'only-id' }, { status: 201 })));

    const error = await createPayout({
      amount: 100,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
    }).catch((caught: unknown) => caught);

    expect(error).toMatchObject({ code: 'invalid_response' });
  });
});

describe('merchant API', () => {
  it('loads the account overview and a cursor page', async () => {
    const merchant = await getMerchant();
    expect(merchant.currency).toBe('GBP');
    expect(merchant.available_balance).toBe(500_000);
    expect(merchant.activity.length).toBeGreaterThan(0);

    const page = await getActivityPage(null);
    expect(page.items.length).toBeGreaterThan(0);
    expect(typeof page.has_more).toBe('boolean');
  });
});
