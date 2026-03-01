import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '../../constants/theme';
import { openExternalUrl } from '../../lib/safeLinking';

/**
 * ProductCard — displays a single product in the recommendations/my-style grid.
 *
 * @param {{ product: { id: string, name: string, image_url: string, price: number, buy_url: string } }} props
 */
export function ProductCard({ product }) {
  const handleBuy = async () => {
    // Reuse shared URL safety checks for external product links.
    await openExternalUrl(product?.buy_url);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleBuy} activeOpacity={0.85}>
      <Image
        source={{ uri: product.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.price != null && (
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    margin: spacing.xs,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  info: {
    padding: spacing.sm,
  },
  name: {
    ...typography.caption,
    color: colors.text,
  },
  price: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
