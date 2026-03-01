import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickerTile } from '../../components/onboarding/PickerTile';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { saveOnboardingStyleGoals } from '../../features/onboarding/onboardingProfileService';
import { colors, spacing, typography } from '../../constants/theme';

const STYLE_GOAL_OPTIONS = ['Casual', 'Professional', 'Trendy', 'Athletic', 'Minimalist', 'Bohemian', 'Streetwear', 'Classic'];

export default function StyleGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleGoal = (goal) => {
    const updated = new Set(selected);
    if (updated.has(goal)) {
      updated.delete(goal);
    } else {
      updated.add(goal);
    }
    setSelected(updated);
  };

  const handleNext = async () => {
    if (selected.size === 0 || !user?.id) return;
    setError(null);
    setLoading(true);
    try {
      await saveOnboardingStyleGoals(user.id, selected);
      router.push('/onboarding/swipe');
    } catch (err) {
      setError(err?.message || 'Failed to save your selections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl + Math.max(insets.left, insets.right),
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>What style goals do you have?</Text>
        <Text style={styles.subtitle}>Select all that apply.</Text>

        <View style={styles.grid}>
          {STYLE_GOAL_OPTIONS.map((goal) => (
            <PickerTile key={goal} label={goal} selected={selected.has(goal)} onPress={() => toggleGoal(goal)} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Next" onPress={handleNext} loading={loading} disabled={selected.size === 0 || loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footer: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.destructive,
    textAlign: 'center',
  },
});
