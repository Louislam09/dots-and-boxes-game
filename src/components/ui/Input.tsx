// components/ui/Input.tsx - Reusable input component

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName = '',
  inputClassName = '',
  isPassword = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      
      <View
        className={`
          flex-row items-center
          bg-white
          border rounded-xl
          ${hasError ? 'border-red-500' : 'border-gray-300'}
          ${props.editable === false ? 'bg-gray-100' : ''}
        `}
      >
        {leftIcon && (
          <View className="pl-3">{leftIcon}</View>
        )}
        
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          className={`
            flex-1
            px-4 py-3
            text-base text-gray-900
            ${leftIcon ? 'pl-2' : ''}
            ${rightIcon || isPassword ? 'pr-2' : ''}
            ${inputClassName}
          `}
          placeholderTextColor="#9CA3AF"
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-3"
          >
            <Text className="text-gray-500">
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View className="pr-3">{rightIcon}</View>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
      
      {hint && !error && (
        <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
      )}
    </View>
  );
}

export default Input;

