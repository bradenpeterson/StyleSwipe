import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useRecommendations } from '../../hooks/useRecommendations';
import { openExternalUrl } from '../../lib/safeLinking';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { colors, radii, spacing, typography } from '../../constants/theme';

const NUM_COLUMNS = 2;

function ProductCard({ product, itemWidth, onBuyNow }) {
  if (!product) return null;

  const imageHeight = itemWidth * 1.2;
  const raw = product.price;
  const priceDisplay =
    raw != null && raw !== ''
      ? typeof raw === 'string' && (raw.startsWith('$') || Number.isNaN(Number(raw)))
        ? raw
        : `$${Number(raw).toFixed(2)}`
      : '-';

  return (
    <Card style={[styles.card, { width: itemWidth }]} elevated>
      <Image source={{ uri: product.image_url }} style={[styles.cardImage, { height: imageHeight }]} resizeMode="cover" />
      <View style={styles.cardInfo}>
        {product.brand ? (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {product.title ?? ''}
        </Text>
        <Text style={styles.price}>{priceDisplay}</Text>
        <Button label="Shop Now" onPress={() => onBuyNow(product)} style={styles.buyButton} />
      </View>
    </Card>
  );
}

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const { items, loading, error, refetch } = useRecommendations(user?.id, 20);
  const [refreshing, setRefreshing] = useState(false);

  const horizontalPadding = spacing.lg + Math.max(insets.left, insets.right);
  const gap = spacing.md;
  const contentWidth = windowWidth - horizontalPadding * 2;
  const itemWidth = (contentWidth - gap) / NUM_COLUMNS;

  const padding = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xl,
    paddingHorizontal: horizontalPadding,
  };

  const handleBuyNow = async (product) => {
    await openExternalUrl(product?.buy_url);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return null;

  if (loading && items.length === 0) {
    return (
      <View style={[styles.container, padding]}>
        <View style={styles.loadingGrid}>
          <SkeletonLoader width="55%" height={24} borderRadius={radii.pill} />
          <SkeletonLoader width="40%" height={12} />
          <View style={styles.row}>
            <SkeletonLoader width="48%" height={260} borderRadius={radii.card} />
            <SkeletonLoader width="48%" height={260} borderRadius={radii.card} />
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
          title="Couldn't load picks"
          description="Try again in a moment."
          actionLabel="Retry"
          onAction={refetch}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, padding]}>
        <Text style={styles.heading}>For You</Text>
        <Text style={styles.caption}>Picked for your style</Text>
        <EmptyState
          emoji="🛍️"
          title="Nothing to show yet"
          description="Swipe in Discover to unlock recommendations."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, padding]}>
      <Text style={styles.heading}>For You</Text>
      <Text style={styles.caption}>Picked for your style</Text>

      <FlatList
        data={items}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={[styles.row, { marginBottom: gap }]}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} itemWidth={itemWidth} onBuyNow={handleBuyNow} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heading: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  caption: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  loadingGrid: {
    gap: spacing.sm,
  },
  gridContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    borderRadius: radii.card,
  },
  cardImage: {
    width: '100%',
    backgroundColor: colors.surface,
  },
  cardInfo: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  brand: {
    ...typography.label,
    color: colors.textSecondary,
  },
  cardTitle: {
    ...typography.subheading,
  },
  price: {
    ...typography.body,
    color: colors.accent,
  },
  buyButton: {
    marginTop: spacing.sm,
  },
});
