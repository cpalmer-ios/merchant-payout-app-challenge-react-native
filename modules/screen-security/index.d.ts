export function getDeviceId(): string;

export function isBiometricAuthenticated(): Promise<boolean>;

export function addScreenshotListener(listener: () => void): { remove: () => void };
