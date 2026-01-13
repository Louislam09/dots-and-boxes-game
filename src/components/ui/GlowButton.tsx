// components/ui/GlowButton.tsx - Clean button (no glow)

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  glow?: boolean;
  pulse?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlowButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
}: GlowButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: COLORS.accent.primary,
          text: '#0A0E27',
        };
      case 'secondary':
        return {
          bg: COLORS.accent.secondary,
          text: '#FFFFFF',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: COLORS.accent.primary,
          border: COLORS.accent.primary,
        };
      case 'ghost':
        return {
          bg: COLORS.glass.background,
          text: COLORS.text.secondary,
          border: COLORS.glass.border,
        };
      case 'danger':
        return {
          bg: COLORS.status.error,
          text: '#FFFFFF',
        };
      case 'success':
        return {
          bg: COLORS.status.success,
          text: '#FFFFFF',
        };
      default:
        return {
          bg: COLORS.accent.primary,
          text: '#0A0E27',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, borderRadius: 10 };
      case 'md':
        return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16, borderRadius: 12 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 24, fontSize: 17, borderRadius: 14 };
      case 'xl':
        return { paddingVertical: 18, paddingHorizontal: 28, fontSize: 18, borderRadius: 14 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16, borderRadius: 12 };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
          borderWidth: colors.border ? 1.5 : 0,
          borderColor: colors.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: sizeStyles.fontSize,
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default GlowButton;
