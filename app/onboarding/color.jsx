import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { PickerTile } from '../../components/onboarding/PickerTile';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../constants/theme';

const COLOR_OPTIONS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Gray'];

export default function ColorPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleColor = (color) => {
    const updated = new Set(selected);
    if (updated.has(color)) {
      updated.delete(color);
    } else {
      updated.add(color);
    }
    setSelected(updated);
  };

  const handleNext = async () => {
    if (!user?.id) return;
    setError(null);
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferred_colors: Array.from(selected) })
        .eq('id', user.id);
      if (updateError) throw updateError;
      router.push('/onboarding/category');
    } catch (err) {
      setError(err.message || 'Failed to save colors');
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
        <Text style={styles.title}>What colors do you love?</Text>
        <Text style={styles.subtitle}>Select as many as you'd like.</Text>

        <View style={styles.grid}>
          {COLOR_OPTIONS.map((colorOption) => (
            <PickerTile
              key={colorOption}
              label={colorOption}
              selected={selected.has(colorOption)}
              onPress={() => toggleColor(colorOption)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Next" onPress={handleNext} loading={loading} disabled={loading || selected.size === 0} />
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
