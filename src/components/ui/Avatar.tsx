// components/ui/Avatar.tsx - User avatar component

import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { getInitials } from '../../utils/helpers';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs',
    indicator: 'w-2 h-2 -right-0.5 -bottom-0.5',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-sm',
    indicator: 'w-2.5 h-2.5 -right-0.5 -bottom-0.5',
  },
  md: {
    container: 'w-12 h-12',
    text: 'text-base',
    indicator: 'w-3 h-3 right-0 bottom-0',
  },
  lg: {
    container: 'w-16 h-16',
    text: 'text-xl',
    indicator: 'w-4 h-4 right-0.5 bottom-0.5',
  },
  xl: {
    container: 'w-24 h-24',
    text: 'text-3xl',
    indicator: 'w-5 h-5 right-1 bottom-1',
  },
};

// Generate a consistent color based on name
function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  source,
  name = '?',
  size = 'md',
  showOnlineIndicator = false,
  isOnline = false,
  className = '',
}: AvatarProps) {
  const sizeStyle = sizeStyles[size];
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <View className={`relative ${className}`}>
      {source ? (
        <Image
          source={{ uri: source }}
          className={`${sizeStyle.container} rounded-full`}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className={`
            ${sizeStyle.container}
            ${bgColor}
            rounded-full
            items-center justify-center
          `}
        >
          <Text className={`${sizeStyle.text} font-bold text-white`}>
            {initials}
          </Text>
        </View>
      )}

      {showOnlineIndicator && (
        <View
          className={`
            absolute
            ${sizeStyle.indicator}
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
            rounded-full
            border-2 border-white
          `}
        />
      )}
    </View>
  );
}

export default Avatar;

