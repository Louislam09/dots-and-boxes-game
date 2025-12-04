// components/ui/Card.tsx - Reusable card component

import React, { ReactNode } from 'react';
import { View, TouchableOpacity, ViewProps } from 'react-native';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantStyles = {
  default: 'bg-white',
  elevated: 'bg-white shadow-lg shadow-black/10',
  outlined: 'bg-white border border-gray-200',
};

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  className = '',
}: CardProps) {
  const baseClassName = `
    rounded-2xl
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={baseClassName}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={baseClassName}>{children}</View>;
}

// Card Header
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <View className={`mb-3 ${className}`}>
      {children}
    </View>
  );
}

// Card Title
interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <View className={`text-lg font-bold text-gray-900 ${className}`}>
      {children}
    </View>
  );
}

// Card Content
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <View className={className}>{children}</View>;
}

// Card Footer
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <View className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </View>
  );
}

export default Card;

