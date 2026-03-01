import { StyleSheet, View } from 'react-native';
import { colors, radii, shadows } from '../../constants/theme';

export function Card({ children, style, elevated = false }) {
  return <View style={[styles.base, elevated && styles.elevated, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.subtle,
  },
});
