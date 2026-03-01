import { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, minTouchTarget, radii, spacing, typography } from '../../constants/theme';
import { SkeletonLoader } from './SkeletonLoader';

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = true,
  style,
  textStyle,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const palette = useMemo(() => {
    if (variant === 'secondary') {
      return {
        backgroundColor: colors.accentLight,
        borderColor: colors.accent,
        textColor: colors.accent,
      };
    }
    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: colors.textSecondary,
      };
    }
    if (variant === 'destructive') {
      return {
        backgroundColor: colors.destructive,
        borderColor: colors.destructive,
        textColor: colors.white,
      };
    }
    return {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      textColor: colors.white,
    };
  }, [variant]);

  const animateTo = (value) => {
    Animated.timing(scale, {
      toValue: value,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        disabled={disabled || loading}
        style={[
          styles.base,
          {
            backgroundColor: palette.backgroundColor,
            borderColor: palette.borderColor,
          },
          disabled && styles.disabled,
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <SkeletonLoader width={64} height={12} borderRadius={radii.pill} />
          </View>
        ) : (
          <Text style={[styles.label, { color: palette.textColor }, textStyle]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    minHeight: 56,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    ...typography.label,
  },
  loadingWrap: {
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
