// components/ui/Avatar.tsx - Avatar component (clean)

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  imageUrl?: string;
  className?: string;
  style?: ViewStyle;
  glowColor?: string;
}

export function Avatar({
  name,
  size = 'md',
  imageUrl,
  className = '',
  style,
}: AvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { size: 32, fontSize: 12 };
      case 'md':
        return { size: 40, fontSize: 14 };
      case 'lg':
        return { size: 56, fontSize: 18 };
      case 'xl':
        return { size: 80, fontSize: 24 };
      default:
        return { size: 40, fontSize: 14 };
    }
  };

  const getColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const colors = [
      COLORS.accent.primary,
      COLORS.accent.secondary,
      COLORS.players.player1,
      COLORS.players.player2,
      COLORS.players.player3,
      COLORS.accent.tertiary,
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const sizeStyles = getSizeStyles();
  const bgColor = getColor(name);
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius: sizeStyles.size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
      className={className}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Avatar;
