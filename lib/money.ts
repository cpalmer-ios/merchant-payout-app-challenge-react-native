import type { Currency } from '@/types/api';

/**
 * Payouts at or below this value (1,000.00 in the selected currency) do not
 * require biometrics. The API speaks minor units, so the comparison stays in
 * integers: 1,000.00 is 100,000 minor units.
 */
export const BIOMETRIC_THRESHOLD_MINOR = 100_000;

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: '£',
  EUR: '€',
};

const MAX_WHOLE_UNITS = Math.floor(Number.MAX_SAFE_INTEGER / 100);

export type AmountInputState =
  | { readonly status: 'empty' }
  | { readonly status: 'invalid' }
  | { readonly status: 'negative' }
  | { readonly status: 'zero'; readonly minor: 0 }
  | { readonly status: 'positive'; readonly minor: number };

/**
 * Interpret a major-unit amount typed by a person.
 * Conversion is integer-only so values such as 0.29 become 29 minor units,
 * never a binary float rounded back into money.
 */
export function interpretAmountInput(raw: string): AmountInputState {
  const value = raw.trim();
  if (value.length === 0 || value === '.' || value === '-' || value === '-.') {
    return { status: 'empty' };
  }

  const match = /^(-)?(\d*)(?:\.(\d{0,2}))?$/.exec(value);
  if (!match) {
    return { status: 'invalid' };
  }

  const sign = match[1];
  const wholeText = match[2] ?? '';
  const fractionText = match[3] ?? '';

  if (wholeText.length > 13) {
    return { status: 'invalid' };
  }

  const whole = wholeText.length === 0 ? 0 : Number(wholeText);
  if (!Number.isSafeInteger(whole) || whole > MAX_WHOLE_UNITS) {
    return { status: 'invalid' };
  }

  const fraction = Number(`${fractionText}00`.slice(0, 2));
  const minor = whole * 100 + fraction;
  if (!Number.isSafeInteger(minor)) {
    return { status: 'invalid' };
  }

  if (sign) {
    return { status: 'negative' };
  }
  if (minor === 0) {
    return { status: 'zero', minor: 0 };
  }
  return { status: 'positive', minor };
}

export function requiresBiometricAuthentication(minor: number): boolean {
  return minor > BIOMETRIC_THRESHOLD_MINOR;
}

export function formatMinorUnits(minor: number, currency: Currency): string {
  if (!Number.isInteger(minor)) {
    return '—';
  }

  const negative = minor < 0;
  const absolute = Math.abs(minor);
  const whole = Math.trunc(absolute / 100);
  const fraction = absolute % 100;
  const digits = `${groupThousands(whole)}.${fraction.toString().padStart(2, '0')}`;
  const symbol = CURRENCY_SYMBOLS[currency];
  return negative ? `${symbol}-${digits}` : `${symbol}${digits}`;
}

export function amountErrorMessage(state: AmountInputState, touched: boolean): string | null {
  if (!touched) {
    return null;
  }
  if (state.status === 'invalid') {
    return 'Enter an amount with up to 2 decimal places.';
  }
  if (state.status === 'negative') {
    return 'Enter an amount greater than zero.';
  }
  return null;
}

function groupThousands(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
