// components/ui/Toast.tsx - Toast notification component

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { GAME_CONFIG } from '../../constants/game';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const typeStyles: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500',
    text: 'text-white',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-white',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-500',
    text: 'text-white',
    icon: 'ℹ',
  },
};

export function Toast({
  visible,
  message,
  type = 'info',
  duration = GAME_CONFIG.TOAST_DURATION.default,
  onHide,
  action,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const style = typeStyles[type];

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <View
        className={`
          ${style.bg}
          rounded-xl
          px-4 py-3
          flex-row items-center
          shadow-lg
        `}
      >
        <Text className={`${style.text} text-lg mr-2`}>{style.icon}</Text>
        <Text className={`${style.text} flex-1 font-medium`}>{message}</Text>
        
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              hideToast();
            }}
            className="ml-2"
          >
            <Text className={`${style.text} font-bold underline`}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={hideToast} className="ml-2 p-1">
          <Text className={style.text}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Hook for managing toast state
import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      setToast({ visible: true, message, type, duration });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error', GAME_CONFIG.TOAST_DURATION.error),
    showWarning: (message: string) => showToast(message, 'warning'),
    showInfo: (message: string) => showToast(message, 'info'),
  };
}

export default Toast;

