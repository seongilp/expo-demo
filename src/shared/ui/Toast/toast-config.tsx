import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';
import { lightTokens } from '@/shared/config';

export const toastConfig = {
  success: (props: BaseToastProps): React.JSX.Element => (
    <BaseToast
      {...props}
      style={[styles.base, styles.success]}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props: BaseToastProps): React.JSX.Element => (
    <ErrorToast
      {...props}
      style={[styles.base, styles.error]}
      contentContainerStyle={styles.content}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: ({ text1, text2 }: { text1?: string; text2?: string }): React.JSX.Element => (
    <View style={[styles.base, styles.info, styles.custom]}>
      {text1 && <Text style={styles.text1}>{text1}</Text>}
      {text2 && <Text style={styles.text2}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  base: {
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: lightTokens.surface,
  },
  success: {
    borderLeftColor: lightTokens.primary,
  },
  error: {
    borderLeftColor: lightTokens.danger,
  },
  info: {
    borderLeftColor: lightTokens.priceDown,
  },
  content: {
    paddingHorizontal: 16,
  },
  custom: {
    padding: 16,
    minHeight: 60,
  },
  text1: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTokens.textPrimary,
  },
  text2: {
    fontSize: 12,
    color: lightTokens.textSecondary,
  },
});
