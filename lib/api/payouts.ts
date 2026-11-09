import type { CreatePayoutRequest, PayoutResponse } from '@/types/api';

import { apiRequest } from './client';
import { ApiError } from './errors';
import { payoutResponseSchema } from './schemas';

export async function createPayout(request: CreatePayoutRequest): Promise<PayoutResponse> {
  const payout = await apiRequest('/api/payouts', payoutResponseSchema, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  if (payout.status === 'failed') {
    throw new ApiError(
      'The payout could not be completed. Please try again.',
      201,
      'payout_failed',
    );
  }

  return payout;
}
