import { authorisePayout, biometricFailureMessage, type SecurityClient } from './authorise-payout';

function security(overrides: Partial<SecurityClient> = {}): SecurityClient {
  return {
    getDeviceId: () => 'device-1',
    isBiometricAuthenticated: async () => true,
    ...overrides,
  };
}

describe('authorisePayout', () => {
  it('sends the device id without a biometric prompt at or below 1,000.00', async () => {
    const authenticate = jest.fn(async () => true);
    const result = await authorisePayout(100_000, security({ isBiometricAuthenticated: authenticate }));

    expect(result).toEqual({ ok: true, deviceId: 'device-1' });
    expect(authenticate).not.toHaveBeenCalled();
  });

  it('requires a successful biometric check above 1,000.00', async () => {
    const authenticate = jest.fn(async () => true);
    const result = await authorisePayout(100_001, security({ isBiometricAuthenticated: authenticate }));

    expect(result).toEqual({ ok: true, deviceId: 'device-1' });
    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  it('aborts when the prompt resolves false', async () => {
    const result = await authorisePayout(
      150_000,
      security({ isBiometricAuthenticated: async () => false }),
    );
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });

  it('tells the merchant to set up biometrics when none are enrolled', async () => {
    const error = Object.assign(new Error('not enrolled'), { code: 'BIOMETRICS_NOT_ENROLLED' });
    const result = await authorisePayout(
      150_000,
      security({
        isBiometricAuthenticated: async () => {
          throw error;
        },
      }),
    );
    expect(result).toEqual({ ok: false, reason: 'not_enrolled' });
  });

  it('still allows a small payout when the device id cannot be read', async () => {
    const result = await authorisePayout(
      100,
      security({
        getDeviceId: () => {
          throw new Error('unavailable');
        },
      }),
    );
    expect(result).toEqual({ ok: true, deviceId: 'unknown-device' });
  });
});

describe('biometricFailureMessage', () => {
  it('matches the cancelled-prompt copy', () => {
    expect(biometricFailureMessage('cancelled')).toBe('Biometric authentication was cancelled.');
    expect(biometricFailureMessage('not_enrolled')).toContain('Settings');
  });
});
