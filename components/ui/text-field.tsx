import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type TextFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly hint?: string | null;
  readonly error?: string | null;
  readonly keyboardType?: 'default' | 'decimal-pad';
  readonly autoCapitalize?: 'none' | 'characters' | 'sentences' | 'words';
  readonly autoCorrect?: boolean;
  readonly testID?: string;
};

export function TextField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  hint,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  testID,
}: TextFieldProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const negative = useThemeColor({}, 'negative');
  const message = error ?? hint;

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={muted}
        style={[styles.input, { backgroundColor: surface, borderColor: error ? negative : border, color: text }]}
        testID={testID}
        value={value}
      />
      {message ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          lightColor={error ? negative : muted}
          darkColor={error ? negative : muted}
          style={styles.message}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
