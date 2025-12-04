// components/ui/Button.tsx - Reusable button component

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-indigo-600 active:bg-indigo-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-emerald-600 active:bg-emerald-700',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border-2 border-indigo-600 active:bg-indigo-50',
    text: 'text-indigo-600',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-gray-700',
  },
  danger: {
    container: 'bg-red-600 active:bg-red-700',
    text: 'text-white',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-1.5 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-2.5 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-3.5 rounded-xl',
    text: 'text-lg',
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  textClassName = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center
        ${sizeStyle.container}
        ${variantStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#4F46E5' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text className="mr-2">{icon}</Text>
          )}
          <Text
            className={`
              font-semibold
              ${sizeStyle.text}
              ${variantStyle.text}
              ${textClassName}
            `}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Text className="ml-2">{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;

