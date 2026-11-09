import { requireOptionalNativeModule } from 'expo-modules-core';

const native = requireOptionalNativeModule('ScreenSecurity');

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function getDeviceId() {
  if (!native) {
    throw codedError('BIOMETRICS_UNAVAILABLE', 'ScreenSecurity native module is unavailable');
  }
  return native.getDeviceId();
}

export function isBiometricAuthenticated() {
  if (!native) {
    return Promise.reject(
      codedError('BIOMETRICS_UNAVAILABLE', 'ScreenSecurity native module is unavailable'),
    );
  }
  return native.isBiometricAuthenticated();
}

export function addScreenshotListener(listener) {
  if (!native) {
    return { remove() {} };
  }
  const subscription = native.addListener('onScreenshotTaken', listener);
  return {
    remove() {
      subscription.remove();
    },
  };
}
