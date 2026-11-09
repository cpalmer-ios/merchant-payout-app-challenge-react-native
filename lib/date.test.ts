import { formatActivityDate } from './date';

describe('formatActivityDate', () => {
  it('formats an ISO timestamp as DD MM YYYY in the local timezone', () => {
    expect(formatActivityDate('2026-01-23T15:04:00.000Z')).toBe('23 01 2026');
    expect(formatActivityDate('2026-11-09T00:00:00.000Z')).toBe('09 11 2026');
  });

  it('returns an empty string for a value that is not a date', () => {
    expect(formatActivityDate('not-a-date')).toBe('');
  });
});
