// components/ui/GradientBackground.tsx - Animated gradient background

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'auth' | 'game';
  animated?: boolean;
}

export function GradientBackground({
  children,
  variant = 'default',
  animated = true,
}: GradientBackgroundProps) {
  const opacity1 = useSharedValue(0.15);
  const opacity2 = useSharedValue(0.1);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      opacity1.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 3000 }),
          withTiming(0.15, { duration: 3000 })
        ),
        -1,
        true
      );
      opacity2.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 4000 }),
          withTiming(0.1, { duration: 4000 })
        ),
        -1,
        true
      );
      scale1.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 8000 }),
          withTiming(1, { duration: 8000 })
        ),
        -1,
        true
      );
      scale2.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 10000 }),
          withTiming(1, { duration: 10000 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedOrb1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ scale: scale1.value }],
  }));

  const animatedOrb2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [{ scale: scale2.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Base background */}
      <View style={styles.baseGradient} />

      {/* Animated orbs for visual interest */}
      {animated && (
        <>
          <Animated.View
            style={[
              styles.orb,
              styles.orb1,
              { backgroundColor: COLORS.accent.primary },
              animatedOrb1,
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb2,
              { backgroundColor: COLORS.accent.secondary },
              animatedOrb2,
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb3,
              { backgroundColor: COLORS.accent.tertiary },
              animatedOrb1,
            ]}
          />
        </>
      )}

      {/* Subtle noise/texture overlay */}
      <View style={styles.noiseOverlay} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.5,
    right: -width * 0.4,
  },
  orb2: {
    width: width * 0.8,
    height: width * 0.8,
    bottom: height * 0.1,
    left: -width * 0.4,
  },
  orb3: {
    width: width * 0.5,
    height: width * 0.5,
    bottom: -width * 0.2,
    right: -width * 0.1,
    opacity: 0.1,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: '#FFFFFF',
  },
});

export default GradientBackground;
