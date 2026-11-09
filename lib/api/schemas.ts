import { z } from 'zod';

import type {
  ActivityItem,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
} from '@/types/api';

export const currencySchema = z.enum(['GBP', 'EUR']);

export const activityItemSchema: z.ZodType<ActivityItem> = z.object({
  id: z.string().min(1),
  type: z.enum(['payout', 'deposit', 'refund', 'fee']),
  amount: z.number().int(),
  currency: currencySchema,
  date: z.string().min(1),
  description: z.string(),
  status: z.enum(['completed', 'pending', 'processing', 'failed']),
});

export const merchantDataSchema: z.ZodType<MerchantDataResponse> = z.object({
  available_balance: z.number().int(),
  pending_balance: z.number().int(),
  currency: currencySchema,
  activity: z.array(activityItemSchema),
});

export const paginatedActivitySchema: z.ZodType<PaginatedActivityResponse> = z.object({
  items: z.array(activityItemSchema),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});

export const payoutResponseSchema: z.ZodType<PayoutResponse> = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  amount: z.number().int(),
  currency: currencySchema,
  iban: z.string().min(1),
  created_at: z.string().min(1),
});

export const apiErrorBodySchema = z.object({
  error: z.string().min(1),
});
