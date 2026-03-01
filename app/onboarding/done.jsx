import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../constants/theme';

export default function DoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id);

      if (error) throw error;
      router.replace('/(tabs)/discover');
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.xl + Math.max(insets.left, insets.right),
        },
      ]}
    >
      <View style={styles.content}>
        <Image source={require('../../assets/logo_cropped.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>You're all set</Text>
        <Text style={styles.subtitle}>We've learned your style. Let's discover pieces you'll love.</Text>
      </View>

      <Button label="Start discovering" onPress={handleStart} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
