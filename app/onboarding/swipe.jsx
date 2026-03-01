import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { SwipeCardStack } from '../../components/SwipeCardStack';
import { CARD_DIMENSIONS } from '../../components/SwipeCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors, radii, spacing, typography } from '../../constants/theme';
import {
  fetchOnboardingCards,
  markOnboardingComplete,
  submitOnboardingSwipe,
} from '../../features/onboarding/onboardingSwipeService';

export default function OnboardingSwipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swipedCount, setSwipedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(8);
  const [completing, setCompleting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const navigateToDiscover = () => {
    router.replace('/(tabs)/discover?fromOnboarding=1');
  };

  const loadCards = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOnboardingCards({ limit: 8 });
      setCards(result);
      setSwipedCount(0);
      setTotalCount(result.length || 8);
    } catch (err) {
      setError(err?.message ?? 'Failed to load onboarding cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadCards();
  }, [user?.id]);

  const handleSwipe = async (itemId, direction) => {
    if (!user?.id || completing) return;

    setShowTooltip(false);

    try {
      await submitOnboardingSwipe({
        userId: user.id,
        itemId,
        direction,
      });
    } catch (err) {
      setError(err?.message ?? 'Failed to save swipe');
      return;
    }

    let nextSwipedCount = swipedCount + 1;
    setCards((prev) => prev.filter((card) => card.id !== itemId));
    setSwipedCount((prev) => {
      nextSwipedCount = prev + 1;
      return nextSwipedCount;
    });

    if (nextSwipedCount >= totalCount) {
      setCompleting(true);
      try {
        await markOnboardingComplete(user.id);
        navigateToDiscover();
      } catch (err) {
        setError(err?.message ?? 'Failed to complete onboarding');
      } finally {
        setCompleting(false);
      }
    }
  };

  const handleSkip = async () => {
    if (!user?.id || completing) return;
    setCompleting(true);
    setError(null);
    try {
      await markOnboardingComplete(user.id);
      navigateToDiscover();
    } catch (err) {
      setError(err?.message ?? 'Failed to skip setup');
    } finally {
      setCompleting(false);
    }
  };

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: spacing.lg + Math.max(insets.left, insets.right),
  };

  if (!user) return null;

  return (
    <View style={[styles.container, padding]}>
      <View style={styles.header}>
        <View style={styles.progressRow}>
          {Array.from({ length: totalCount }).map((_, index) => {
            const completed = index < swipedCount;
            return <View key={`progress-pill-${index}`} style={[styles.progressPill, completed && styles.progressPillFilled]} />;
          })}
        </View>
      </View>

      <View style={styles.stackWrap}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <SkeletonLoader
              width={CARD_DIMENSIONS.width}
              height={CARD_DIMENSIONS.height}
              borderRadius={radii.cardLarge}
            />
          </View>
        ) : error ? (
          <EmptyState
            emoji="!"
            title="Couldn't load setup cards"
            description={error}
            actionLabel="Retry"
            onAction={loadCards}
          />
        ) : cards.length === 0 ? (
          <EmptyState
            emoji="✨"
            title="Setup complete"
            description="Taking you to Discover."
            actionLabel="Continue"
            onAction={handleSkip}
          />
        ) : (
          <View style={styles.stackArea}>
            <SwipeCardStack
              items={cards}
              onSwipe={handleSwipe}
              renderEmpty={() => <View style={styles.stackPlaceholder} />}
            />

            {showTooltip ? (
              <View style={styles.tooltip}>
                <Ionicons name="arrow-back" size={16} color={colors.textPrimary} />
                <Text style={styles.tooltipText}>swipe to react</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textPrimary} />
              </View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSkip}
          disabled={completing}
          accessibilityRole="button"
          accessibilityLabel="Skip setup"
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>Skip setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 32,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressPill: {
    flex: 1,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  progressPillFilled: {
    backgroundColor: colors.accent,
  },
  stackWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  loadingWrap: {
    width: '100%',
    alignItems: 'center',
  },
  stackArea: {
    position: 'relative',
  },
  stackPlaceholder: {
    minHeight: 320,
  },
  tooltip: {
    position: 'absolute',
    bottom: spacing.xxxl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tooltipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  skipButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
