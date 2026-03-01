import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
        // Safe fallback: send user through onboarding if profile lookup fails.
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
        <ActivityIndicator size="large" color="#0a0a0a" />
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
    backgroundColor: '#fff',
  },
});
