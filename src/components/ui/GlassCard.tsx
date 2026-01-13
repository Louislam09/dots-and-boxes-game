// components/ui/GlassCard.tsx - Card component (no shadows)

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  className?: string;
  style?: ViewStyle;
}

export function GlassCard({
  children,
  variant = 'default',
  className = '',
  style,
}: GlassCardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.glass.backgroundLight,
          borderColor: COLORS.glass.borderLight,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.glass.border,
        };
      case 'accent':
        return {
          backgroundColor: COLORS.glass.background,
          borderColor: COLORS.accent.primary,
        };
      default:
        return {
          backgroundColor: COLORS.glass.background,
          borderColor: COLORS.glass.border,
        };
    }
  };

  return (
    <View
      style={[styles.card, getVariantStyle(), style]}
      className={className}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
});

export default GlassCard;
