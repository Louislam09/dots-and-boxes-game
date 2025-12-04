// app/register.tsx - Registration screen

import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Toast, useToast } from '../components/ui';
import { validators } from '../utils/validators';
import { KeyboardPaddingView } from '@/components/common/keyboard-padding';
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

  const handleRegister = async () => {
    // Validate
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
    <View className="flex-1 ">
      <ScrollView
        className="flex-1 "
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-indigo-600 overflow-hidden rounded-2xl items-center justify-center mb-4">
              <Image
                style={{ width: 80, height: 80 }}
                source={require('@/assets/images/icon.png')}
              />
            </View>
            {/* <View className="w-20 h-20 bg-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Text className="text-4xl">🎮</Text>
            </View> */}
            <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
            <Text className="text-gray-500 mt-2">Join and start playing!</Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-3xl p-6 shadow-sm">
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
              hint="Min 8 chars, uppercase, lowercase, number"
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

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/login" asChild>
              <Text className="text-indigo-600 font-semibold">Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Toast {...toast} onHide={hideToast} />
      <KeyboardPaddingView />
    </View>
  );
}

