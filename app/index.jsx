import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, spacing } from '../constants/theme';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/sign-up');
      return;
    }

    let cancelled = false;
    const routeByOnboardingStatus = async () => {
      setCheckingOnboarding(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        router.replace('/onboarding');
      } else if (data?.has_onboarded) {
        router.replace('/(tabs)/discover');
      } else {
        router.replace('/onboarding');
      }
      setCheckingOnboarding(false);
    };

    routeByOnboardingStatus();

    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  if (loading || checkingOnboarding) {
    return (
      <View style={styles.centered}>
        <SkeletonLoader width={160} height={12} />
        <SkeletonLoader width={92} height={12} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
});
