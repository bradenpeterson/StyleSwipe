import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SwipeCard, CardContent, CARD_DIMENSIONS } from './SwipeCard';
import { colors, radii, spacing, typography } from '../constants/theme';

const { width: CARD_WIDTH, height: CARD_HEIGHT } = CARD_DIMENSIONS;

const SwipeCardStackComponent = forwardRef(({ items, onSwipe, renderEmpty }, ref) => {
  const topCardRef = useRef(null);

  const visible = items.slice(0, 3);
  const topItem = visible[0];
  const displayRest = visible.slice(1, 3);

  const handleSwipeFromCard = useCallback(
    (itemId, direction) => {
      onSwipe(itemId, direction);
    },
    [onSwipe]
  );

  const handleProgrammaticLike = useCallback(() => {
    topCardRef.current?.swipe?.('like');
  }, []);

  const handleProgrammaticSkip = useCallback(() => {
    topCardRef.current?.swipe?.('skip');
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      swipeLike: handleProgrammaticLike,
      swipeSkip: handleProgrammaticSkip,
    }),
    [handleProgrammaticLike, handleProgrammaticSkip]
  );

  if (items.length === 0) {
    if (renderEmpty) return renderEmpty();
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No more for now</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {displayRest.map((item, index) => (
        <View
          key={`back-${index}-${item.id}`}
          style={[
            styles.backCard,
            {
              top: 0,
              // Keep back cards at full size so promoted cards don't visually "grow" on activation.
              transform: [{ scale: 1 }],
              zIndex: 2 - index,
            },
          ]}
        >
          {item?.image_url ? <CardContent item={item} /> : <View style={styles.cardPlaceholder} />}
        </View>
      ))}
      {topItem ? (
        <View style={styles.topCard}>
          <SwipeCard ref={topCardRef} key={topItem.id} item={topItem} onSwipe={handleSwipeFromCard} enabled />
        </View>
      ) : null}
    </View>
  );
});

export const SwipeCardStack = SwipeCardStackComponent;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCard: {
    position: 'absolute',
    zIndex: 3,
    top: 0,
  },
  backCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.cardLarge,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: radii.cardLarge,
    backgroundColor: colors.surface,
  },
  empty: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.cardLarge,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
