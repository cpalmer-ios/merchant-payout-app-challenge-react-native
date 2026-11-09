import { apiErrorBodySchema } from './schemas';

export type ApiErrorCode =
  | 'network'
  | 'invalid_response'
  | 'insufficient_funds'
  | 'unavailable'
  | 'client'
  | 'server'
  | 'payout_failed';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(message: string, status: number, code: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function mapHttpError(status: number, body: unknown): ApiError {
  const parsed = apiErrorBodySchema.safeParse(body);
  const serverMessage = parsed.success ? parsed.data.error : 'Request failed';

  if (status === 400 && /insufficient funds/i.test(serverMessage)) {
    return new ApiError(serverMessage, status, 'insufficient_funds');
  }
  if (status === 503) {
    return new ApiError(serverMessage, status, 'unavailable');
  }
  if (status >= 500) {
    return new ApiError(serverMessage, status, 'server');
  }
  if (status >= 400) {
    return new ApiError(serverMessage, status, 'client');
  }
  return new ApiError(serverMessage, status, 'server');
}

export function toPayoutFailureMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.code) {
    case 'insufficient_funds':
      return 'Insufficient funds.';
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again later.';
    case 'network':
      return 'Network error. Check your connection and try again.';
    case 'invalid_response':
      return "We couldn't read the server response. Please try again.";
    case 'payout_failed':
      return 'The payout could not be completed. Please try again.';
    case 'client':
    case 'server':
      return error.message.endsWith('.') ? error.message : `${error.message}.`;
    default: {
      const exhaustive: never = error.code;
      return exhaustive;
    }
  }
}
