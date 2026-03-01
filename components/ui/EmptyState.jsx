import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { Button } from './Button';

export function EmptyState({ emoji = '✨', title, description, actionLabel, onAction }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  emoji: {
    ...typography.display,
    color: colors.textSecondary,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
  },
});
