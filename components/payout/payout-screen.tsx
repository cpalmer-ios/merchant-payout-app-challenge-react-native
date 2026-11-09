import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ConfirmDialog } from '@/components/payout/confirm-dialog';
import { CurrencyField } from '@/components/payout/currency-field';
import { PayoutResult } from '@/components/payout/payout-result';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useScreenshotWarning } from '@/hooks/use-screenshot-warning';
import { toPayoutFailureMessage } from '@/lib/api/errors';
import { createPayout } from '@/lib/api/payouts';
import { formatIbanGroups, ibanErrorMessage, isValidIban, normalizeIban } from '@/lib/iban';
import { amountErrorMessage, interpretAmountInput, requiresBiometricAuthentication } from '@/lib/money';
import { authorisePayout, biometricFailureMessage } from '@/lib/security/authorise-payout';
import type { Currency } from '@/types/api';

type PayoutPhase =
  | { readonly name: 'editing' }
  | { readonly name: 'review' }
  | { readonly name: 'submitting'; readonly stage: 'biometrics' | 'network' }
  | { readonly name: 'success'; readonly amountMinor: number; readonly currency: Currency }
  | { readonly name: 'failure'; readonly message: string };

const IBAN_HINT = 'Enter the destination bank account IBAN';

export function PayoutScreen() {
  const [amountText, setAmountText] = useState('');
  const [iban, setIban] = useState('');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [amountTouched, setAmountTouched] = useState(false);
  const [ibanTouched, setIbanTouched] = useState(false);
  const [phase, setPhase] = useState<PayoutPhase>({ name: 'editing' });
  const submitting = useRef(false);

  useScreenshotWarning();

  const amount = interpretAmountInput(amountText);
  const canReview = amount.status === 'positive' && isValidIban(iban);
  const showResult = phase.name === 'submitting' || phase.name === 'success' || phase.name === 'failure';
  const ibanError = ibanErrorMessage(iban, ibanTouched);

  const openReview = () => {
    setAmountTouched(true);
    setIbanTouched(true);
    if (!canReview) {
      return;
    }
    setPhase({ name: 'review' });
  };

  const submit = () => {
    if (amount.status !== 'positive' || !isValidIban(iban) || submitting.current) {
      return;
    }

    const minor = amount.minor;
    submitting.current = true;
    setPhase({
      name: 'submitting',
      stage: requiresBiometricAuthentication(minor) ? 'biometrics' : 'network',
    });

    void completePayout(minor).finally(() => {
      submitting.current = false;
    });
  };

  const completePayout = async (minor: number) => {
    try {
      const authorisation = await authorisePayout(minor);
      if (!authorisation.ok) {
        setPhase({ name: 'failure', message: biometricFailureMessage(authorisation.reason) });
        return;
      }

      setPhase({ name: 'submitting', stage: 'network' });
      const payout = await createPayout({
        amount: minor,
        currency,
        iban: normalizeIban(iban),
        device_id: authorisation.deviceId,
      });
      setPhase({ name: 'success', amountMinor: payout.amount, currency: payout.currency });
    } catch (error) {
      setPhase({ name: 'failure', message: toPayoutFailureMessage(error) });
    }
  };

  const reset = () => {
    setAmountText('');
    setIban('');
    setCurrency('GBP');
    setAmountTouched(false);
    setIbanTouched(false);
    setPhase({ name: 'editing' });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.header}>
          <ThemedText type="title">{showResult ? 'Payout' : 'Send Payout'}</ThemedText>
        </View>
        {phase.name === 'submitting' ? <PayoutResult phase="submitting" stage={phase.stage} /> : null}
        {phase.name === 'success' ? (
          <PayoutResult
            amountMinor={phase.amountMinor}
            currency={phase.currency}
            onCreateAnother={reset}
            phase="success"
          />
        ) : null}
        {phase.name === 'failure' ? (
          <PayoutResult
            message={phase.message}
            onTryAgain={() => {
              setPhase({ name: 'editing' });
            }}
            phase="failure"
          />
        ) : null}
        {showResult ? null : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <TextField
                  error={amountErrorMessage(amount, amountTouched)}
                  keyboardType="decimal-pad"
                  label="Amount"
                  onBlur={() => {
                    setAmountTouched(true);
                    setAmountText((current) => current.trim());
                  }}
                  onChangeText={setAmountText}
                  placeholder="0.00"
                  testID="amount-input"
                  value={amountText}
                />
              </View>
              <CurrencyField onChange={setCurrency} value={currency} />
            </View>
            <TextField
              autoCapitalize="characters"
              autoCorrect={false}
              error={ibanError}
              hint={ibanError ? null : IBAN_HINT}
              label="IBAN"
              onBlur={() => {
                setIbanTouched(true);
                setIban((current) => (isValidIban(current) ? formatIbanGroups(current) : current));
              }}
              onChangeText={setIban}
              testID="iban-input"
              value={iban}
            />
            <Button
              disabled={!canReview}
              label="Confirm"
              onPress={openReview}
              testID="review-payout"
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <ConfirmDialog
        amountMinor={amount.status === 'positive' ? amount.minor : 0}
        currency={currency}
        iban={iban}
        onCancel={() => {
          setPhase({ name: 'editing' });
        }}
        onConfirm={submit}
        visible={phase.name === 'review'}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 20,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  amountField: {
    flex: 1,
  },
});
