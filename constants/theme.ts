import { Platform } from 'react-native';

const fontSans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const colors = {
  background: '#FAF8F5',
  surface: '#F2EFE9',
  border: '#E8E3DB',
  textPrimary: '#1C1C1A',
  textSecondary: '#8A8680',
  accent: '#7D9B76',
  accentLight: '#EBF0EA',
  destructive: '#C97B6A',
  white: '#FFFFFF',

  // Legacy aliases to avoid logic changes while migrating styles.
  text: '#1C1C1A',
  textMuted: '#8A8680',
  primary: '#7D9B76',
  primaryForeground: '#FFFFFF',
  error: '#C97B6A',

  // Visual utility tokens.
  overlayDarkLow: 'rgba(0, 0, 0, 0.12)',
  overlayDarkMid: 'rgba(0, 0, 0, 0.20)',
  overlayDarkHigh: 'rgba(0, 0, 0, 0.35)',
  overlayLightSoft: 'rgba(255, 255, 255, 0.22)',
  overlayCharcoal: 'rgba(28, 28, 26, 0.45)',
  warmMutedSurface: '#F0E5E2',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  small: 8,
  input: 12,
  card: 16,
  cardLarge: 24,
  pill: 100,

  // Legacy aliases.
  sm: 8,
  md: 12,
  lg: 16,
  button: 100,
} as const;

export const typography = {
  display: {
    fontFamily: fontSans,
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: fontSans,
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  subheading: {
    fontFamily: fontSans,
    fontSize: 17,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontSans,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: fontSans,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fontSans,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textPrimary,
  },

  // Legacy aliases.
  title: {
    fontFamily: fontSans,
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontSans,
    fontSize: 17,
    fontWeight: '500' as const,
    color: colors.textPrimary,
  },
  button: {
    fontFamily: fontSans,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.white,
  },
  link: {
    fontFamily: fontSans,
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.accent,
  },
} as const;

export const shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

export const minTouchTarget = 44;
