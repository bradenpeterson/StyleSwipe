import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radii } from '../../constants/theme';

export function SkeletonLoader({ width = '100%', height = 16, borderRadius = radii.input, style }) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
  },
});

export function SkeletonBlock({ lines = 3, lineHeight = 12, gap = 8 }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          // eslint-disable-next-line react/no-array-index-key
          key={`skeleton-line-${index}`}
          width={index === lines - 1 ? '75%' : '100%'}
          height={lineHeight}
        />
      ))}
    </View>
  );
}
