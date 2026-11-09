import { fireEvent, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Alert } from 'react-native';
import { getDeviceId, isBiometricAuthenticated } from 'screen-security';

import { PayoutScreen } from '@/components/payout/payout-screen';
import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/server.test';
import { renderWithQuery } from '@/test/render';

jest.mock('screen-security', () => ({
  getDeviceId: jest.fn(() => 'device-test-1'),
  isBiometricAuthenticated: jest.fn(async () => true),
  addScreenshotListener: jest.fn((listener: () => void) => {
    globalThis.__screenshotListener = listener;
    return { remove: jest.fn() };
  }),
}));

declare global {
  var __screenshotListener: (() => void) | undefined;
}

const payoutUrl = `${API_BASE_URL}/api/payouts`;
const validIban = 'GB29NWBK60161331926819';
const invalidIban = 'FR1212345123451234567A12310131231231231';

function renderPayout() {
  return renderWithQuery(<PayoutScreen />);
}

function enterPayout(amount: string, iban = validIban) {
  fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  fireEvent.changeText(screen.getByLabelText('IBAN'), iban);
}

function review() {
  fireEvent.press(screen.getByTestId('review-payout'));
}

describe('PayoutScreen', () => {
  beforeEach(() => {
    jest.mocked(getDeviceId).mockReturnValue('device-test-1');
    jest.mocked(isBiometricAuthenticated).mockReset();
    jest.mocked(isBiometricAuthenticated).mockResolvedValue(true);
    globalThis.__screenshotListener = undefined;
  });

  it('keeps Confirm disabled until the amount is positive and the IBAN is valid', () => {
    renderPayout();
    const confirm = screen.getByTestId('review-payout');

    expect(confirm).toBeDisabled();
    expect(screen.getByLabelText('Amount').props.keyboardType).toBe('decimal-pad');

    enterPayout('0');
    expect(confirm).toBeDisabled();

    enterPayout('-5');
    fireEvent(screen.getByLabelText('Amount'), 'blur');
    expect(screen.getByText('Enter an amount greater than zero.')).toBeTruthy();
    expect(confirm).toBeDisabled();

    enterPayout('10.999');
    fireEvent(screen.getByLabelText('Amount'), 'blur');
    expect(screen.getByText('Enter an amount with up to 2 decimal places.')).toBeTruthy();
    expect(confirm).toBeDisabled();

    enterPayout('400', invalidIban);
    fireEvent(screen.getByLabelText('IBAN'), 'blur');
    expect(screen.getByText('Enter a valid IBAN.')).toBeTruthy();
    expect(confirm).toBeDisabled();

    enterPayout('400', validIban);
    expect(confirm).toBeEnabled();
  });

  it('summarises the payout and sends minor units with the device id', async () => {
    let captured: unknown;
    server.use(
      http.post(payoutUrl, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json(
          {
            id: 'payout_1',
            status: 'completed',
            amount: 40_000,
            currency: 'GBP',
            iban: validIban,
            created_at: '2026-01-23T00:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );

    renderPayout();
    enterPayout('400');
    review();

    expect(screen.getByText('Confirm Payout')).toBeTruthy();
    expect(screen.getByText('£400.00')).toBeTruthy();
    expect(screen.getAllByText('GBP').length).toBeGreaterThan(1);
    expect(screen.getByText('GB29**************6819')).toBeTruthy();

    fireEvent.press(screen.getByTestId('cancel-payout'));
    expect(screen.queryByText('Confirm Payout')).toBeNull();

    review();
    fireEvent.press(screen.getByTestId('submit-payout'));

    expect(await screen.findByText('Payout Completed')).toBeTruthy();
    expect(screen.getByText('Your payout of £400.00 has been processed successfully.')).toBeTruthy();
    expect(jest.mocked(isBiometricAuthenticated)).not.toHaveBeenCalled();
    expect(captured).toEqual({
      amount: 40_000,
      currency: 'GBP',
      iban: validIban,
      device_id: 'device-test-1',
    });

    fireEvent.press(screen.getByTestId('create-another'));
    expect(screen.getByText('Send Payout')).toBeTruthy();
    expect(screen.getByLabelText('Amount').props.value).toBe('');
  });

  it('can pay out in EUR when that is not the account currency', async () => {
    server.use(
      http.post(payoutUrl, async ({ request }) => {
        const body: unknown = await request.json();
        expect(body).toMatchObject({ amount: 25_050, currency: 'EUR', device_id: 'device-test-1' });
        return HttpResponse.json(
          {
            id: 'payout_eur',
            status: 'completed',
            amount: 25_050,
            currency: 'EUR',
            iban: validIban,
            created_at: '2026-01-23T00:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );

    renderPayout();
    fireEvent.press(screen.getByTestId('currency-select'));
    fireEvent.press(screen.getByTestId('currency-option-EUR'));
    enterPayout('250.50');
    review();

    expect(screen.getByText('€250.50')).toBeTruthy();
    expect(screen.getAllByText('EUR').length).toBeGreaterThan(1);
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('Your payout of €250.50 has been processed successfully.')).toBeTruthy();
  });

  it('does not ask for biometrics at exactly 1,000.00', async () => {
    renderPayout();
    enterPayout('1000');
    review();
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('Payout Completed')).toBeTruthy();
    expect(jest.mocked(isBiometricAuthenticated)).not.toHaveBeenCalled();
  });

  it('aborts a large payout when biometrics are cancelled or not set up', async () => {
    server.use(
      http.post(payoutUrl, () => {
        throw new Error('payout should not be sent');
      }),
    );

    renderPayout();
    enterPayout('1000.01');
    review();
    jest.mocked(isBiometricAuthenticated).mockResolvedValueOnce(false);
    fireEvent.press(screen.getByTestId('submit-payout'));

    expect(await screen.findByText('Biometric authentication was cancelled.')).toBeTruthy();
    expect(screen.getByText('Unable to Process Payout')).toBeTruthy();

    fireEvent.press(screen.getByTestId('try-again'));
    expect(screen.getByLabelText('Amount').props.value).toBe('1000.01');

    review();
    jest.mocked(isBiometricAuthenticated).mockRejectedValueOnce(
      Object.assign(new Error('not enrolled'), { code: 'BIOMETRICS_NOT_ENROLLED' }),
    );
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText(/Set up Face ID or fingerprint authentication in Settings/)).toBeTruthy();
  });

  it('shows insufficient funds, service unavailable, a failed payout, and network errors', async () => {
    renderPayout();

    enterPayout('888.88');
    review();
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('Insufficient funds.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('try-again'));
    enterPayout('999.99');
    review();
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('Service temporarily unavailable. Please try again later.')).toBeTruthy();

    fireEvent.press(screen.getByTestId('try-again'));
    enterPayout('1.99');
    review();
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('The payout could not be completed. Please try again.')).toBeTruthy();

    server.use(http.post(payoutUrl, () => HttpResponse.error()));
    fireEvent.press(screen.getByTestId('try-again'));
    review();
    fireEvent.press(screen.getByTestId('submit-payout'));
    expect(await screen.findByText('Network error. Check your connection and try again.')).toBeTruthy();
  });

  it('warns when a screenshot is taken on the payout screen', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderPayout();

    globalThis.__screenshotListener?.();

    expect(alert).toHaveBeenCalledWith(
      'Security Reminder',
      'Please keep your financial data private. Screenshots may contain sensitive information.',
    );
    alert.mockRestore();
  });
});
