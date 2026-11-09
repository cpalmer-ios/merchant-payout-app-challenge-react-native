import { useEffect } from 'react';
import { Alert } from 'react-native';
import { addScreenshotListener } from 'screen-security';

const TITLE = 'Security Reminder';
const MESSAGE =
  'Please keep your financial data private. Screenshots may contain sensitive information.';

export function useScreenshotWarning(): void {
  useEffect(() => {
    const subscription = addScreenshotListener(() => {
      Alert.alert(TITLE, MESSAGE);
    });
    return () => {
      subscription.remove();
    };
  }, []);
}
