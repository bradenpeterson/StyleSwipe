import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TAXONOMY, getAllTags } from '../../constants/tags';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors, spacing, typography } from '../../constants/theme';

const CATEGORY_LABELS = {
  style: 'Style',
  color: 'Color',
  material: 'Material',
  occasion: 'Occasion',
  category: 'Category',
  fit: 'Fit',
  pattern: 'Pattern',
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('tag_scores, preferred_styles, preferred_colors, preferred_categories')
        .eq('id', user.id)
        .single();
      if (fetchError) throw fetchError;
      setProfile(data);
      const scores = data?.tag_scores ?? {};
      const preferred = new Set([
        ...(data?.preferred_styles ?? []),
        ...(data?.preferred_colors ?? []),
        ...(data?.preferred_categories ?? []),
      ]);
      const withScores = new Set(
        Object.entries(scores)
          .filter(([, value]) => typeof value === 'number' && value > 0)
          .map(([key]) => key)
      );
      setSelectedTags(new Set([...preferred, ...withScores]));
    } catch (loadError) {
      setError(loadError?.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/sign-up');
    } catch {
      // Keep existing behavior: fail silently and stay on profile.
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setSaveMessage(null);
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      const current = profile?.tag_scores ?? {};
      const newScores = {};
      const allTags = getAllTags();
      for (const tag of allTags) {
        if (selectedTags.has(tag)) {
          newScores[tag] = Math.max(current[tag] ?? 0, 0.5);
        } else {
          newScores[tag] = 0;
        }
      }
      const preferred_styles = TAXONOMY.style.filter((tag) => selectedTags.has(tag));
      const preferred_colors = TAXONOMY.color.filter((tag) => selectedTags.has(tag));
      const preferred_categories = TAXONOMY.category.filter((tag) => selectedTags.has(tag));

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tag_scores: newScores,
          preferred_styles,
          preferred_colors,
          preferred_categories,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setProfile((prev) => ({
        ...prev,
        tag_scores: newScores,
        preferred_styles,
        preferred_colors,
        preferred_categories,
      }));
      setSaveMessage('Saved');
    } catch (saveError) {
      setSaveMessage(saveError?.message ?? 'Failed to save');
    } finally {
      setSaveLoading(false);
    }
  };

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xxl,
    paddingHorizontal: spacing.lg + Math.max(insets.left, insets.right),
  };

  if (!user) return null;

  if (loading && !profile) {
    return (
      <View style={[styles.container, padding]}>
        <View style={styles.loadingWrap}>
          <SkeletonLoader width={84} height={84} borderRadius={42} />
          <SkeletonLoader width="60%" height={20} />
          <SkeletonLoader width="100%" height={120} />
        </View>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.container, padding]}>
        <EmptyState
          emoji="!"
          title="Couldn't load profile"
          description={error}
          actionLabel="Retry"
          onAction={loadProfile}
        />
      </View>
    );
  }

  const initial = user?.email ? user.email.trim().charAt(0).toUpperCase() : '?';

  return (
    <ScrollView
      style={[styles.container, padding]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {user?.email ?? ''}
        </Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.sectionInner}>
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          <Text style={styles.sectionSubtitle}>Tune your tags for more relevant looks.</Text>

          {Object.entries(TAXONOMY).map(([key, tags]) => (
            <View key={key} style={styles.categoryBlock}>
              <Text style={styles.categoryLabel}>{CATEGORY_LABELS[key] ?? key}</Text>
              <View style={styles.chipWrap}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    selected={selectedTags.has(tag)}
                    onPress={() => toggleTag(tag)}
                    tone="accent"
                  />
                ))}
              </View>
            </View>
          ))}

          {saveMessage ? (
            <Text style={saveMessage === 'Saved' ? styles.saveSuccess : styles.saveError}>{saveMessage}</Text>
          ) : null}

          <Button label="Save preferences" onPress={handleSavePreferences} loading={saveLoading} />
        </View>
      </Card>

      <TouchableOpacity style={styles.signOutWrap} onPress={handleLogout}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    gap: spacing.xl,
  },
  loadingWrap: {
    gap: spacing.md,
    alignItems: 'center',
  },
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.heading,
  },
  email: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  section: {
    borderRadius: 16,
  },
  sectionInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
  },
  sectionSubtitle: {
    ...typography.caption,
  },
  categoryBlock: {
    gap: spacing.sm,
  },
  categoryLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  saveSuccess: {
    ...typography.caption,
    color: colors.accent,
  },
  saveError: {
    ...typography.caption,
    color: colors.destructive,
  },
  signOutWrap: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signOutText: {
    ...typography.body,
    color: colors.destructive,
  },
});
