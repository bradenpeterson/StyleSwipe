import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

export function Input({ label, error, style, inputStyle, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          inputStyle,
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  input: {
    minHeight: 56,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    ...typography.body,
  },
  inputFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  error: {
    ...typography.caption,
    color: colors.destructive,
  },
});
