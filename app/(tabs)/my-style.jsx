import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useMyStyle } from '../../hooks/useMyStyle';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors, radii, spacing, typography } from '../../constants/theme';

const NUM_COLUMNS = 2;
const ASPECT_RATIO = 5 / 4;

function GridItem({ item, itemWidth, itemHeight }) {
  const [revealed, setRevealed] = useState(false);

  if (!item?.image_url) return null;

  return (
    <TouchableOpacity
      style={[styles.gridItemWrap, { width: itemWidth, height: itemHeight }]}
      activeOpacity={0.95}
      onLongPress={() => setRevealed(true)}
      onPressOut={() => setRevealed(false)}
      delayLongPress={220}
    >
      <Image source={{ uri: item.image_url }} style={styles.gridImage} resizeMode="cover" />
      {revealed ? (
        <View style={styles.removeOverlay}>
          <Text style={styles.removeText}>Remove</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function MyStyleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const { items, topTags, loading, error, refetch } = useMyStyle(user?.id);

  const horizontalPadding = spacing.lg + Math.max(insets.left, insets.right);
  const gap = spacing.sm;
  const contentWidth = Math.max(0, windowWidth - horizontalPadding * 2);
  const itemWidth = contentWidth > 0 ? (contentWidth - gap) / NUM_COLUMNS : 0;
  const itemHeight = itemWidth * ASPECT_RATIO;

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: horizontalPadding,
  };

  if (!user) {
    return (
      <View style={[styles.container, padding]}>
        <EmptyState
          emoji="🔒"
          title="Sign in to see your style"
          description="Your liked looks appear here once you're signed in."
          actionLabel="Sign in"
          onAction={() => router.replace('/login')}
        />
      </View>
    );
  }

  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, padding]}>
        <View style={styles.skeletonGrid}>
          <SkeletonLoader width="100%" height={24} borderRadius={radii.pill} />
          <View style={styles.gridRow}>
            <SkeletonLoader width="48%" height={220} borderRadius={radii.card} />
            <SkeletonLoader width="48%" height={220} borderRadius={radii.card} />
          </View>
          <View style={styles.gridRow}>
            <SkeletonLoader width="48%" height={220} borderRadius={radii.card} />
            <SkeletonLoader width="48%" height={220} borderRadius={radii.card} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, padding]}>
        <EmptyState
          emoji="!"
          title="Couldn't load your style"
          description="Try again in a moment."
          actionLabel="Retry"
          onAction={refetch}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, padding]}>
      <Text style={styles.header}>My Style</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dnaRow}>
        {topTags.map((tag) => (
          <Chip key={tag} label={tag} tone="accent" />
        ))}
      </ScrollView>

      {items.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title="Nothing saved yet"
          description="Start swiping to build your style"
          actionLabel="Go to Discover"
          onAction={() => router.replace('/(tabs)/discover')}
        />
      ) : (
        <FlatList
          data={items}
          numColumns={NUM_COLUMNS}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={[styles.gridRow, { marginBottom: gap }]}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <GridItem item={item} itemWidth={itemWidth} itemHeight={itemHeight} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...typography.heading,
    marginBottom: spacing.sm,
  },
  dnaRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  skeletonGrid: {
    gap: spacing.md,
  },
  gridContent: {
    paddingBottom: spacing.xl,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridItemWrap: {
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  removeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    ...typography.label,
    color: colors.white,
  },
});
