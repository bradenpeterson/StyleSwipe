import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { PickerTile } from '../../components/onboarding/PickerTile';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../constants/theme';

const CATEGORY_OPTIONS = ['Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories', 'Outerwear', 'Skirts', 'Shorts'];

export default function CategoryPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleCategory = (category) => {
    const updated = new Set(selected);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }
    setSelected(updated);
  };

  const handleComplete = async () => {
    if (!user?.id) return;
    setError(null);
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          has_onboarded: true,
          preferred_categories: Array.from(selected),
        })
        .eq('id', user.id);
      if (updateError) throw updateError;
      router.replace('/(tabs)/discover');
    } catch (err) {
      setError(err.message || 'Failed to save categories');
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
        <Text style={styles.title}>What do you shop for most?</Text>
        <Text style={styles.subtitle}>Select your favorite categories.</Text>

        <View style={styles.grid}>
          {CATEGORY_OPTIONS.map((category) => (
            <PickerTile
              key={category}
              label={category}
              selected={selected.has(category)}
              onPress={() => toggleCategory(category)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Complete" onPress={handleComplete} loading={loading} disabled={loading || selected.size === 0} />
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
