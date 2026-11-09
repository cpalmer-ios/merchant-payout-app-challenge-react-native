import { formatIbanGroups, ibanErrorMessage, isValidIban, maskIban, normalizeIban } from './iban';

const VALID_GB = 'GB29NWBK60161331926819';
const INVALID_FR = 'FR1212345123451234567A12310131231231231';

describe('isValidIban', () => {
  it('accepts a real GB IBAN, including spaces and lowercase', () => {
    expect(isValidIban(VALID_GB)).toBe(true);
    expect(isValidIban('gb29 nwbk 6016 1331 9268 19')).toBe(true);
  });

  it('rejects the challenge invalid sample', () => {
    expect(isValidIban(INVALID_FR)).toBe(false);
  });

  it('rejects a wrong checksum, a truncated IBAN, and empty input', () => {
    expect(isValidIban('GB29NWBK60161331926818')).toBe(false);
    expect(isValidIban('GB29NWBK6016133192681')).toBe(false);
    expect(isValidIban('')).toBe(false);
    expect(isValidIban('not an iban')).toBe(false);
  });
});

describe('maskIban', () => {
  it('keeps the first and last four characters visible', () => {
    expect(maskIban(VALID_GB)).toBe('GB29**************6819');
    expect(maskIban('gb29 nwbk 6016 1331 9268 19')).toBe('GB29**************6819');
  });
});

describe('formatIbanGroups', () => {
  it('prints the IBAN in groups of four', () => {
    expect(formatIbanGroups(VALID_GB)).toBe('GB29 NWBK 6016 1331 9268 19');
  });
});

describe('normalizeIban', () => {
  it('strips whitespace and uppercases', () => {
    expect(normalizeIban(' gb29 nwbk 6016 1331 9268 19 ')).toBe(VALID_GB);
  });
});

describe('ibanErrorMessage', () => {
  it('explains an empty or invalid IBAN only after the field is touched', () => {
    expect(ibanErrorMessage('', false)).toBeNull();
    expect(ibanErrorMessage('', true)).toBe('Enter the destination IBAN.');
    expect(ibanErrorMessage(INVALID_FR, true)).toBe('Enter a valid IBAN.');
    expect(ibanErrorMessage(VALID_GB, true)).toBeNull();
  });
});
