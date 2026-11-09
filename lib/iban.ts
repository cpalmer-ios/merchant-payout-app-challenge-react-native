/**
 * ISO 13616 lengths for the country codes a merchant is likely to pay.
 * Unknown countries still have to pass the mod-97 check and the 15–34
 * length bound, so a newly issued country is not rejected outright.
 */
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  BY: 28,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IQ: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SC: 31,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
};

export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) {
    return false;
  }
  if (iban.length < 15 || iban.length > 34) {
    return false;
  }

  const expectedLength = IBAN_LENGTHS[iban.slice(0, 2)];
  if (expectedLength !== undefined && iban.length !== expectedLength) {
    return false;
  }

  return mod97(iban) === 1;
}

export function maskIban(input: string): string {
  const iban = normalizeIban(input);
  if (iban.length <= 8) {
    return iban;
  }
  const hidden = '*'.repeat(iban.length - 8);
  return `${iban.slice(0, 4)}${hidden}${iban.slice(-4)}`;
}

export function formatIbanGroups(input: string): string {
  return normalizeIban(input)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function ibanErrorMessage(value: string, touched: boolean): string | null {
  if (!touched) {
    return null;
  }
  if (value.trim().length === 0) {
    return 'Enter the destination IBAN.';
  }
  if (!isValidIban(value)) {
    return 'Enter a valid IBAN.';
  }
  return null;
}

function mod97(iban: string): number {
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let expanded = '';
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    expanded += code >= 65 && code <= 90 ? String(code - 55) : char;
  }
  return Number(BigInt(expanded) % 97n);
}
