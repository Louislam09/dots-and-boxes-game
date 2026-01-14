// components/game/Dot.tsx - Individual dot with rotating preview + hover state

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isPreview: boolean;
  isHovered?: boolean;  // New: dot is being hovered during drag
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
  dotSize: number;
  hitArea: number;
  previewColor?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Dot = memo(function Dot({ 
  dot, 
  isSelected, 
  isPreview,
  isHovered,
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
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPreview) {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
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

  // Scale animation for hover/selected state - bigger when drawing
  useEffect(() => {
    if (isHovered) {
      scale.value = withSpring(1.5, { damping: 10, stiffness: 180 });
    } else if (isSelected) {
      scale.value = withSpring(1.4, { damping: 10, stiffness: 180 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [isHovered, isSelected]);

  const previewRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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

  const dotBaseStyle = useMemo(() => ({
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: isHovered 
      ? (previewColor || COLORS.accent.primary)
      : isSelected 
        ? COLORS.game.dotActive 
        : COLORS.game.dot,
    borderWidth: 2,
    borderColor: isHovered || isSelected ? (previewColor || COLORS.accent.primary) : COLORS.glass.borderLight,
    opacity: isInteractive ? 1 : 0.6,
  }), [dotSize, isSelected, isHovered, isInteractive, previewColor]);

  // Preview ring size
  const ringSize = dotSize + 16;
  const ringRadius = (ringSize - 3) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashLength = circumference / 8;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      style={touchAreaStyle}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {/* Rotating preview ring */}
      {isPreview && !isHovered && (
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

      {/* Hover glow ring */}
      {isHovered && (
        <View 
          style={[
            styles.hoverRingContainer,
            { 
              width: ringSize + 8, 
              height: ringSize + 8,
              borderRadius: (ringSize + 8) / 2,
              backgroundColor: previewColor || COLORS.accent.primary,
            },
          ]}
        />
      )}
      
      {/* Main dot */}
      <AnimatedView style={dotAnimatedStyle}>
        <View style={dotBaseStyle} />
      </AnimatedView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  previewRingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoverRingContainer: {
    position: 'absolute',
    opacity: 0.3,
  },
});

export default Dot;
