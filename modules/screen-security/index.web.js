const WEB_DEVICE_ID = 'web-preview-device';

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function getDeviceId() {
  return WEB_DEVICE_ID;
}

/**
 * Browsers cannot present Face ID or a fingerprint prompt. The preview asks
 * the reviewer to stand in for the native result so the payout flow can be
 * exercised. A development build uses the real ScreenSecurity module.
 */
export function isBiometricAuthenticated() {
  if (typeof globalThis.confirm !== 'function') {
    return Promise.reject(
      codedError('BIOMETRICS_NOT_ENROLLED', 'Biometrics are not set up on this device'),
    );
  }

  const accepted = globalThis.confirm(
    'This browser preview has no biometric sensor. Choose OK to simulate a match, or Cancel to simulate a failure.',
  );
  return Promise.resolve(accepted);
}

export function addScreenshotListener() {
  return { remove() {} };
}
