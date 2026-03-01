import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { SwipeCardStack } from '../../components/SwipeCardStack';
import { spacing, colors, typography, radii, minTouchTarget } from '../../constants/theme';
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

    // The instruction tooltip is one-time and disappears on first action.
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
    paddingHorizontal: spacing.xl + Math.max(insets.left, insets.right),
  };

  if (!user) {
    return null;
  }

  return (
    <View style={[styles.container, padding]}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover your style</Text>
        <Text style={styles.subtitle}>
          Swipe a few looks so we can personalize your feed.
        </Text>
        <Text style={styles.progress}>
          {Math.min(swipedCount, totalCount)} of {totalCount}
        </Text>
      </View>

      <View style={styles.stackWrap}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadCards}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.loadingText}>No onboarding cards available.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleSkip}>
              <Text style={styles.retryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stackArea}>
            <SwipeCardStack
              items={cards}
              onSwipe={handleSwipe}
              renderEmpty={() => (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyTitle}>All done swiping!</Text>
                </View>
              )}
            />

            {showTooltip && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  Swipe right if you love it, left to skip it.
                </Text>
                <TouchableOpacity onPress={() => setShowTooltip(false)} activeOpacity={0.8}>
                  <Text style={styles.tooltipDismiss}>Got it</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        disabled={completing}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Skip setup"
      >
        <Text style={styles.skipButtonText}>Skip setup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progress: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stackWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  stackArea: {
    position: 'relative',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.link,
    color: colors.primary,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 22,
    color: colors.text,
  },
  tooltip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: '#111111ee',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tooltipText: {
    ...typography.caption,
    color: colors.primaryForeground,
    textAlign: 'center',
  },
  tooltipDismiss: {
    ...typography.link,
    color: colors.primaryForeground,
    textAlign: 'center',
  },
  skipButton: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.link,
    color: colors.textSecondary,
  },
});
