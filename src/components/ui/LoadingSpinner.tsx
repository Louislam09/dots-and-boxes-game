// components/ui/LoadingSpinner.tsx - Loading spinner (Dark Theme)

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = COLORS.accent.primary,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const content = (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.ring, { borderColor: color }, animatedStyle]}>
          <View style={[styles.ringHighlight, { backgroundColor: color }]} />
        </Animated.View>
        <ActivityIndicator size={size} color={color} style={styles.indicator} />
      </View>
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.primary,
  },
  spinnerContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: COLORS.accent.primary,
    opacity: 0.3,
  },
  ringHighlight: {
    position: 'absolute',
    top: -3,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.primary,
  },
  indicator: {
    position: 'absolute',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default LoadingSpinner;
