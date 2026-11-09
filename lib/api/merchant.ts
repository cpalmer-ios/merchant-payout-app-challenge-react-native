import type { MerchantDataResponse, PaginatedActivityResponse } from '@/types/api';

import { apiRequest } from './client';
import { merchantDataSchema, paginatedActivitySchema } from './schemas';

export const ACTIVITY_PAGE_SIZE = 15;

export function getMerchant(): Promise<MerchantDataResponse> {
  return apiRequest('/api/merchant', merchantDataSchema);
}

export function getActivityPage(cursor: string | null): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams({
    limit: String(ACTIVITY_PAGE_SIZE),
  });
  if (cursor) {
    params.set('cursor', cursor);
  }
  return apiRequest(`/api/merchant/activity?${params.toString()}`, paginatedActivitySchema);
}
