import { ApiError, mapHttpError, toPayoutFailureMessage } from './errors';

describe('mapHttpError', () => {
  it('recognises the mock insufficient-funds and unavailable responses', () => {
    expect(mapHttpError(400, { error: 'Insufficient funds' })).toMatchObject({
      code: 'insufficient_funds',
      status: 400,
    });
    expect(mapHttpError(503, { error: 'Service temporarily unavailable' })).toMatchObject({
      code: 'unavailable',
      status: 503,
    });
  });

  it('keeps other 4xx and 5xx responses distinct from a network failure', () => {
    expect(mapHttpError(422, { error: 'IBAN not supported' }).code).toBe('client');
    expect(mapHttpError(500, { error: 'Internal Server Error' }).code).toBe('server');
    expect(mapHttpError(500, null).message).toBe('Request failed');
  });
});

describe('toPayoutFailureMessage', () => {
  it('uses the copy from the payout failure screens', () => {
    expect(
      toPayoutFailureMessage(new ApiError('Insufficient funds', 400, 'insufficient_funds')),
    ).toBe('Insufficient funds.');
    expect(toPayoutFailureMessage(new ApiError('down', 503, 'unavailable'))).toBe(
      'Service temporarily unavailable. Please try again later.',
    );
    expect(toPayoutFailureMessage(new ApiError('offline', 0, 'network'))).toBe(
      'Network error. Check your connection and try again.',
    );
    expect(toPayoutFailureMessage(new ApiError('failed', 201, 'payout_failed'))).toBe(
      'The payout could not be completed. Please try again.',
    );
  });

  it('falls back when the failure is not an API error', () => {
    expect(toPayoutFailureMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });
});
