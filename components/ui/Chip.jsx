import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

export function Chip({ label, selected = false, onPress, style, textStyle, tone = 'default' }) {
  const isAccent = tone === 'accent';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        isAccent && styles.accent,
        selected && styles.selected,
        style,
      ]}
    >
      <Text style={[styles.text, isAccent && styles.accentText, selected && styles.selectedText, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  base: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accent: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentLight,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    ...typography.label,
    color: colors.textPrimary,
  },
  accentText: {
    color: colors.accent,
  },
  selectedText: {
    color: colors.white,
  },
});
