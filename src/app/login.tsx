// app/login.tsx - Login screen

import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Toast, useToast } from '../components/ui';
import { validators } from '../utils/validators';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast, showError, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    // Validate
    const newErrors: typeof errors = {};

    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        router.replace('/home');
      } else {
        showError(result.error || 'Login failed');
      }
    } catch (error) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Text className="text-4xl">🎮</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
            <Text className="text-gray-500 mt-2">Sign in to continue playing</Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-3xl p-6 shadow-sm">
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
              placeholder="Enter your password"
              isPassword
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Link href="/forgot-password" asChild>
              <Text className="text-right text-indigo-600 font-medium mb-4">
                Forgot Password?
              </Text>
            </Link>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/register" asChild>
              <Text className="text-indigo-600 font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Toast {...toast} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}

