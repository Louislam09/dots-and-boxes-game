// app/register.tsx - Registration screen (Clean)

import { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';
import { Input, Toast, useToast, GlassCard, GlowButton } from '../components/ui';
import { validators } from '../utils/validators';
import { COLORS } from '../constants/colors';
import { Image } from 'expo-image';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast, showError, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    const usernameValidation = validators.username(username);
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.error!;
    }

    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error!;
    }

    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error!;
    }

    const confirmValidation = validators.passwordConfirm(password, passwordConfirm);
    if (!confirmValidation.valid) {
      newErrors.passwordConfirm = confirmValidation.error!;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await register({
        email,
        password,
        passwordConfirm,
        username,
      });

      if (result.success) {
        router.replace('/home');
      } else {
        showError(result.error || 'Registration failed');
      }
    } catch (error) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={require('@/assets/images/icon.png')}
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the game and start playing!</Text>
          </View>

          {/* Form */}
          <GlassCard variant="elevated" style={styles.formCard}>
            <Input
              label="Username"
              placeholder="Choose a username"
              autoCapitalize="none"
              autoComplete="username-new"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              hint="3-20 characters, letters, numbers, underscores"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              isPassword
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              hint="Min 8 chars with uppercase, lowercase & number"
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              isPassword
              autoComplete="password-new"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              error={errors.passwordConfirm}
            />

            <View style={styles.buttonContainer}>
              <GlowButton
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          </GlassCard>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <Text style={styles.footerLink}>Sign In</Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>

      <Toast {...toast} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 20,
    width: 72,
    height: 72,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  formCard: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.accent.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});
