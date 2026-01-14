// components/game/Dot.tsx - Individual dot component with rotating preview indicator

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isPreview: boolean;  // New: is this an adjacent dot that can be connected?
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
  dotSize: number;
  hitArea: number;
  previewColor?: string;  // Color for the preview ring
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Dot = memo(function Dot({ 
  dot, 
  isSelected, 
  isPreview,
  isInteractive, 
  onPress,
  dotSize,
  hitArea,
  previewColor,
}: DotProps) {
  const handlePress = useCallback(() => {
    if (isInteractive) {
      onPress(dot);
    }
  }, [isInteractive, onPress, dot]);

  // Rotation animation for preview ring
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isPreview) {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1, // Infinite
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }

    return () => {
      cancelAnimation(rotation);
    };
  }, [isPreview]);

  const previewRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Memoize styles
  const touchAreaStyle = useMemo(() => ({
    position: 'absolute' as const,
    width: hitArea,
    height: hitArea,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    left: dot.x - hitArea / 2,
    top: dot.y - hitArea / 2,
  }), [dot.x, dot.y, hitArea]);

  const dotStyle = useMemo(() => ({
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: isSelected ? COLORS.game.dotActive : COLORS.game.dot,
    borderWidth: 2,
    borderColor: isSelected ? COLORS.accent.primary : COLORS.glass.borderLight,
    transform: isSelected ? [{ scale: 1.2 }] : [],
    opacity: isInteractive ? 1 : 0.6,
  }), [dotSize, isSelected, isInteractive]);

  // Preview ring size (larger than dot)
  const ringSize = dotSize + 16;
  const ringRadius = (ringSize - 3) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashLength = circumference / 8; // 8 dashes

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      style={touchAreaStyle}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {/* Rotating preview ring */}
      {isPreview && (
        <AnimatedView 
          style={[
            styles.previewRingContainer,
            { width: ringSize, height: ringSize },
            previewRingStyle,
          ]}
        >
          <Svg width={ringSize} height={ringSize}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={previewColor || COLORS.accent.primary}
              strokeWidth={3}
              strokeDasharray={`${dashLength},${dashLength}`}
              fill="none"
              opacity={0.7}
            />
          </Svg>
        </AnimatedView>
      )}
      
      {/* Main dot */}
      <View style={dotStyle} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  previewRingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Dot;
