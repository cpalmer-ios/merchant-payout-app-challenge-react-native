import {
  amountErrorMessage,
  formatMinorUnits,
  interpretAmountInput,
  requiresBiometricAuthentication,
} from './money';

describe('interpretAmountInput', () => {
  it('treats blank and unfinished input as empty', () => {
    expect(interpretAmountInput('')).toEqual({ status: 'empty' });
    expect(interpretAmountInput('   ')).toEqual({ status: 'empty' });
    expect(interpretAmountInput('.')).toEqual({ status: 'empty' });
    expect(interpretAmountInput('-')).toEqual({ status: 'empty' });
  });

  it('converts major units to minor units without binary rounding', () => {
    expect(interpretAmountInput('0.29')).toEqual({ status: 'positive', minor: 29 });
    expect(interpretAmountInput('0.01')).toEqual({ status: 'positive', minor: 1 });
    expect(interpretAmountInput('10.5')).toEqual({ status: 'positive', minor: 1050 });
    expect(interpretAmountInput('10.50')).toEqual({ status: 'positive', minor: 1050 });
    expect(interpretAmountInput('.5')).toEqual({ status: 'positive', minor: 50 });
    expect(interpretAmountInput('00012.30')).toEqual({ status: 'positive', minor: 1230 });
    expect(interpretAmountInput('999.99')).toEqual({ status: 'positive', minor: 99999 });
    expect(interpretAmountInput('888.88')).toEqual({ status: 'positive', minor: 88888 });
  });

  it('accepts a trailing decimal while a whole amount is being typed', () => {
    expect(interpretAmountInput('12.')).toEqual({ status: 'positive', minor: 1200 });
  });

  it('rejects a third decimal place, separators, and scientific notation', () => {
    expect(interpretAmountInput('10.999').status).toBe('invalid');
    expect(interpretAmountInput('1,000.00').status).toBe('invalid');
    expect(interpretAmountInput('1e2').status).toBe('invalid');
    expect(interpretAmountInput('12.3.4').status).toBe('invalid');
    expect(interpretAmountInput('abc').status).toBe('invalid');
  });

  it('distinguishes zero and negative amounts', () => {
    expect(interpretAmountInput('0')).toEqual({ status: 'zero', minor: 0 });
    expect(interpretAmountInput('0.00')).toEqual({ status: 'zero', minor: 0 });
    expect(interpretAmountInput('-5')).toEqual({ status: 'negative' });
    expect(interpretAmountInput('-0.01')).toEqual({ status: 'negative' });
  });

  it('rejects amounts that cannot be stored as a safe integer of minor units', () => {
    expect(interpretAmountInput('90071992547409.99').status).toBe('invalid');
  });
});

describe('requiresBiometricAuthentication', () => {
  it('requires biometrics only when the amount is over 1,000.00', () => {
    expect(requiresBiometricAuthentication(100_000)).toBe(false);
    expect(requiresBiometricAuthentication(99_999)).toBe(false);
    expect(requiresBiometricAuthentication(100_001)).toBe(true);
  });
});

describe('formatMinorUnits', () => {
  it('places the minus after the currency symbol and groups thousands', () => {
    expect(formatMinorUnits(500_000, 'GBP')).toBe('£5,000.00');
    expect(formatMinorUnits(25_000, 'GBP')).toBe('£250.00');
    expect(formatMinorUnits(-186_154, 'GBP')).toBe('£-1,861.54');
    expect(formatMinorUnits(40_000, 'EUR')).toBe('€400.00');
    expect(formatMinorUnits(-150, 'EUR')).toBe('€-1.50');
    expect(formatMinorUnits(0, 'GBP')).toBe('£0.00');
  });

  it('does not invent a figure for a non-integer minor amount', () => {
    expect(formatMinorUnits(10.5, 'GBP')).toBe('—');
  });
});

describe('amountErrorMessage', () => {
  it('stays quiet until the field has been touched', () => {
    expect(amountErrorMessage({ status: 'invalid' }, false)).toBeNull();
    expect(amountErrorMessage({ status: 'negative' }, true)).toBe(
      'Enter an amount greater than zero.',
    );
    expect(amountErrorMessage({ status: 'invalid' }, true)).toBe(
      'Enter an amount with up to 2 decimal places.',
    );
    expect(amountErrorMessage({ status: 'zero', minor: 0 }, true)).toBeNull();
  });
});
