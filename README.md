# StyleSwipe

Mobile app (Expo + React Native + Expo Router) for learning a user's style from swipes and producing product recommendations through Supabase Edge Functions.

## Quick Start

1. Install dependencies: `npm install`
2. Configure env: copy `.env.example` to `.env` and set Supabase values
3. Run app: `npm run start`

## Project Structure

- `app/`: Expo Router screens and navigation
- `contexts/`: auth/session context providers
- `hooks/`: data-fetching and mutation hooks for feed/recommendations/profile
- `components/`: reusable UI and feature components
- `lib/`: shared clients/utilities (Supabase client, safe external linking)
- `supabase/functions/`: Edge Functions (`swipe-feed`, `submit-swipe`, `recommendations`, `my-style`)
- `supabase/migrations/`: database schema and migration history
- `constants/`: tag taxonomy and theme tokens

## Main Entry Points

- App entry: `expo-router/entry` via `package.json`
- Root layout: `app/_layout.jsx`
- Auth/session bootstrap: `contexts/AuthContext.jsx`
- Feature tabs: `app/(tabs)/discover.jsx`, `app/(tabs)/recommendations.jsx`, `app/(tabs)/my-style.jsx`, `app/(tabs)/profile.jsx`

## Core Dependencies

- `expo`, `react`, `react-native`, `expo-router`
- `@supabase/supabase-js`
- `react-native-gesture-handler`, `react-native-reanimated`
