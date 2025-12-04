// app/forgot-password.tsx - Forgot password screen

import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/pocketbase';
import { Button, Input, Card, Toast, useToast } from '../components/ui';
import { validators } from '../utils/validators';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async () => {
    // Validate
    const emailValidation = validators.email(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      const result = await authService.requestPasswordReset(email);

      if (result.success) {
        setIsSent(true);
        showSuccess('Reset email sent!');
      } else {
        showError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
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
        className="flex-1 bg-gray-50"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Text className="text-4xl">🔑</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">Reset Password</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Enter your email and we'll send you a reset link
            </Text>
          </View>

          {/* Form */}
          <Card className="mb-6">
            {isSent ? (
              <View className="items-center py-4">
                <Text className="text-5xl mb-4">📧</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </Text>
                <Text className="text-gray-500 text-center mb-6">
                  We've sent a password reset link to{'\n'}
                  <Text className="font-semibold">{email}</Text>
                </Text>
                <Button
                  title="Back to Login"
                  onPress={() => router.replace('/login')}
                  variant="primary"
                />
              </View>
            ) : (
              <>
                <Input
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  error={error}
                />

                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                />
              </>
            )}
          </Card>

          {/* Footer */}
          {!isSent && (
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Remember your password? </Text>
              <Link href="/login" asChild>
                <Text className="text-indigo-600 font-semibold">Sign In</Text>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>

      <Toast {...toast} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}

