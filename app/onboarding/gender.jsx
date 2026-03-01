import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickerTile } from '../../components/onboarding/PickerTile';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { saveOnboardingGender } from '../../features/onboarding/onboardingProfileService';
import { colors, spacing, typography } from '../../constants/theme';

const GENDER_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function GenderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = async () => {
    if (!selected || !user?.id) return;
    setError(null);
    setLoading(true);
    try {
      await saveOnboardingGender(user.id, selected);
      router.push('/onboarding/age');
    } catch (err) {
      setError(err?.message || 'Failed to save your selection');
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
        <Text style={styles.title}>How do you identify?</Text>
        <Text style={styles.subtitle}>This helps us personalize your recommendations.</Text>
        <View style={styles.grid}>
          {GENDER_OPTIONS.map((gender) => (
            <PickerTile
              key={gender}
              label={gender}
              selected={selected === gender}
              onPress={() => setSelected(gender)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Next" onPress={handleNext} loading={loading} disabled={!selected || loading} />
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
