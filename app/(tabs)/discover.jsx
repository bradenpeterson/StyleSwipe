import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useSwipeFeed } from '../../hooks/useSwipeFeed';
import { SwipeCardStack } from '../../components/SwipeCardStack';
import { CARD_DIMENSIONS } from '../../components/SwipeCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors, spacing, typography } from '../../constants/theme';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { fromOnboarding } = useLocalSearchParams();
  const { user } = useAuth();
  const { queue, loading, error, submitSwipe, fetchMore } = useSwipeFeed(user?.id, 20);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);

  useEffect(() => {
    if (fromOnboarding === '1') {
      setShowOnboardingBanner(true);
      const timeout = setTimeout(() => {
        setShowOnboardingBanner(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [fromOnboarding]);

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.sm,
    paddingHorizontal: spacing.lg + Math.max(insets.left, insets.right),
  };
  const cardVerticalOffset = CARD_DIMENSIONS.height * 0.07;

  const handleSwipe = async (itemId, direction) => {
    setShowOnboardingBanner(false);
    await submitSwipe(itemId, direction);
  };

  if (!user) return null;

  return (
    <View style={[styles.container, padding]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/logo_cropped.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Discover</Text>
        </View>
      </View>

      <View style={[styles.stackWrap, { transform: [{ translateY: cardVerticalOffset }] }]}>
        {showOnboardingBanner ? (
          <View style={styles.onboardingBanner}>
            <Text style={styles.onboardingBannerText}>
              Your style is taking shape - keep swiping to refine it.
            </Text>
          </View>
        ) : null}

        {loading && queue.length === 0 ? (
          <View style={styles.loadingWrap}>
            <SkeletonLoader width={CARD_DIMENSIONS.width} height={CARD_DIMENSIONS.height} borderRadius={24} />
            <SkeletonLoader width="50%" height={12} />
          </View>
        ) : error ? (
          <EmptyState
            emoji="!"
            title="Something went wrong"
            description="We couldn't load new inspiration cards."
            actionLabel="Retry"
            onAction={() => fetchMore(20)}
          />
        ) : (
          <SwipeCardStack
            items={queue}
            onSwipe={handleSwipe}
            renderEmpty={() => (
              <EmptyState
                emoji="📭"
                title="No more inspiration for now"
                description="Check back shortly for fresh looks."
              />
            )}
          />
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 30,
    height: 30,
  },
  title: {
    ...typography.heading,
  },
  stackWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingTop: spacing.sm,
  },
  onboardingBanner: {
    position: 'absolute',
    top: 0,
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 5,
    alignItems: 'center',
  },
  onboardingBannerText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.accentLight,
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loadingWrap: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
});
