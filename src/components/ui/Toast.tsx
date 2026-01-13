// components/ui/Toast.tsx - Toast notification (Dark Theme)

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const { width } = Dimensions.get('window');

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hide = () => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setShouldRender)(false);
      runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: COLORS.status.success,
          icon: '✓',
          iconColor: COLORS.status.success,
        };
      case 'error':
        return {
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          borderColor: COLORS.status.error,
          icon: '✕',
          iconColor: COLORS.status.error,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: COLORS.status.warning,
          icon: '⚠',
          iconColor: COLORS.status.warning,
        };
      case 'info':
      default:
        return {
          backgroundColor: 'rgba(0, 217, 255, 0.15)',
          borderColor: COLORS.accent.primary,
          icon: 'ℹ',
          iconColor: COLORS.accent.primary,
        };
    }
  };

  if (!shouldRender) return null;

  const config = getTypeConfig();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.borderColor }]}>
          <Text style={[styles.icon, { color: '#FFFFFF' }]}>{config.icon}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

// Toast hook for easier usage
interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: width - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
});

export default Toast;
