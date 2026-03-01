import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors, spacing, typography } from '../../constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      router.replace('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.xxxl,
            paddingBottom: insets.bottom + spacing.xxl,
            paddingLeft: spacing.xl + insets.left,
            paddingRight: spacing.xl + insets.right,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo_cropped.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>StyleSwipe</Text>
            <Text style={styles.tagline}>Discover your style</Text>
          </View>

          <View style={styles.inputGroup}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
              accessibilityLabel="Email address"
            />

            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
              accessibilityLabel="Password"
              error={error}
            />
          </View>

          <Button label="Log in" onPress={handleSubmit} loading={loading} style={styles.cta} />

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => router.replace('/sign-up')}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Don't have an account? Sign up"
          >
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inputGroup: {
    gap: spacing.lg,
  },
  cta: {
    marginTop: spacing.sm,
  },
  linkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  linkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
