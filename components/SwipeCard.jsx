import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Image, StyleSheet, Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = Math.round(SCREEN_HEIGHT * 0.75);
const ROTATION_MAX = 13;
const VELOCITY_THRESHOLD = 400;
const SPRING_CONFIG = { damping: 15, stiffness: 150 };
const EXIT_DURATION = 220;

function runExitAnimation(translateX, translateY, rotation, direction, onComplete) {
  'worklet';
  const toX = direction === 'like' ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
  const toRotation = direction === 'like' ? ROTATION_MAX : -ROTATION_MAX;
  translateX.value = withTiming(toX, { duration: EXIT_DURATION }, () => {
    runOnJS(onComplete)(direction);
  });
  translateY.value = withTiming(0, { duration: EXIT_DURATION });
  rotation.value = withTiming(toRotation, { duration: EXIT_DURATION });
}

const SwipeCardComponent = forwardRef(function SwipeCard(
  { item, onSwipe, enabled = true },
  ref
) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const isExiting = useSharedValue(0);
  const hasFiredRef = useRef(false);

  const notifySwipeComplete = useCallback(
    (direction) => {
      if (onSwipe && item?.id) {
        onSwipe(item.id, direction);
      }
    },
    [onSwipe, item?.id]
  );

  const startExit = useCallback(
    (direction) => {
      if (hasFiredRef.current) return;
      hasFiredRef.current = true;
      isExiting.value = 1;
      runExitAnimation(translateX, translateY, rotation, direction, notifySwipeComplete);
    },
    [translateX, translateY, rotation, isExiting, notifySwipeComplete]
  );

  useImperativeHandle(
    ref,
    () => ({
      swipe(direction) {
        if (hasFiredRef.current || !item?.id) return;
        hasFiredRef.current = true;
        isExiting.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        rotation.value = 0;
        runExitAnimation(translateX, translateY, rotation, direction, notifySwipeComplete);
      },
    }),
    [item?.id, translateX, translateY, rotation, isExiting, notifySwipeComplete]
  );

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      if (isExiting.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.25;
      rotation.value = (event.translationX / (CARD_WIDTH / 2)) * ROTATION_MAX;
    })
    .onEnd((event) => {
      if (isExiting.value) return;
      if (event.velocityX > VELOCITY_THRESHOLD) {
        runOnJS(startExit)('like');
      } else if (event.velocityX < -VELOCITY_THRESHOLD) {
        runOnJS(startExit)('skip');
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        rotation.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(translateX.value / 90, 0), 1),
  }));

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(-translateX.value / 90, 0), 1),
  }));

  if (!item?.image_url) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />

        <View style={styles.infoOverlay}>
          {item.name ? (
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
          ) : null}
          {item.tags?.length > 0 ? (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}>
          <Text style={[styles.badgeText, styles.likeBadgeText]}>Love it</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.skipBadge, skipOpacity]}>
          <Text style={[styles.badgeText, styles.skipBadgeText]}>Skip</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

export function CardContent({ item }) {
  if (!item?.image_url) return null;
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.infoOverlay}>
        {item.name ? (
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
        ) : null}
        {item.tags?.length > 0 ? (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const SwipeCard = SwipeCardComponent;
export const CARD_DIMENSIONS = {
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.cardLarge,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.sm,
  },
  itemName: {
    ...typography.subheading,
    color: colors.white,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.overlayLightSoft,
  },
  tagText: {
    ...typography.label,
    color: colors.white,
  },
  badge: {
    position: 'absolute',
    top: spacing.lg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  likeBadge: {
    left: spacing.lg,
    backgroundColor: colors.accentLight,
  },
  skipBadge: {
    right: spacing.lg,
    backgroundColor: colors.warmMutedSurface,
  },
  badgeText: {
    ...typography.label,
  },
  likeBadgeText: {
    color: colors.accent,
  },
  skipBadgeText: {
    color: colors.destructive,
  },
});
