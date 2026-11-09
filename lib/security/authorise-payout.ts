import { getDeviceId, isBiometricAuthenticated } from 'screen-security';

import { requiresBiometricAuthentication } from '@/lib/money';

export type BiometricFailureReason = 'cancelled' | 'not_enrolled' | 'unavailable';

export type PayoutAuthorisation =
  | { readonly ok: true; readonly deviceId: string }
  | { readonly ok: false; readonly reason: BiometricFailureReason };

export type SecurityClient = {
  getDeviceId: () => string;
  isBiometricAuthenticated: () => Promise<boolean>;
};

const nativeSecurity: SecurityClient = {
  getDeviceId: () => getDeviceId(),
  isBiometricAuthenticated: () => isBiometricAuthenticated(),
};

/**
 * Every payout carries the device id. Amounts over 1,000.00 in the selected
 * currency also have to pass the native biometric prompt before the API call.
 */
export async function authorisePayout(
  amountMinor: number,
  security: SecurityClient = nativeSecurity,
): Promise<PayoutAuthorisation> {
  const deviceId = readDeviceId(security);
  if (!requiresBiometricAuthentication(amountMinor)) {
    return { ok: true, deviceId };
  }

  try {
    const authenticated = await security.isBiometricAuthenticated();
    if (!authenticated) {
      return { ok: false, reason: 'cancelled' };
    }
    return { ok: true, deviceId };
  } catch (error) {
    return { ok: false, reason: classifyBiometricError(error) };
  }
}

export function biometricFailureMessage(reason: BiometricFailureReason): string {
  switch (reason) {
    case 'cancelled':
      return 'Biometric authentication was cancelled.';
    case 'not_enrolled':
      return 'Biometrics are not set up. Set up Face ID or fingerprint authentication in Settings, then try again.';
    case 'unavailable':
      return 'Biometric authentication is unavailable on this device.';
    default: {
      const exhaustive: never = reason;
      return exhaustive;
    }
  }
}

function readDeviceId(security: SecurityClient): string {
  try {
    const deviceId = security.getDeviceId().trim();
    return deviceId.length > 0 ? deviceId : 'unknown-device';
  } catch {
    return 'unknown-device';
  }
}

function classifyBiometricError(error: unknown): BiometricFailureReason {
  const code = readErrorCode(error);
  if (code === 'BIOMETRICS_NOT_ENROLLED') {
    return 'not_enrolled';
  }
  if (code === 'BIOMETRICS_UNAVAILABLE') {
    return 'unavailable';
  }
  return 'cancelled';
}

function readErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }
  const code = error.code;
  return typeof code === 'string' ? code : undefined;
}
