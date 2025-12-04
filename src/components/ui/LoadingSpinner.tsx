// components/ui/LoadingSpinner.tsx - Loading indicator component

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = COLORS.primary.DEFAULT,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-3 text-gray-600 text-center">{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}

// Loading overlay for blocking operations
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-2xl px-8 py-6 items-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        {message && (
          <Text className="mt-3 text-gray-700 font-medium">{message}</Text>
        )}
      </View>
    </View>
  );
}

export default LoadingSpinner;

