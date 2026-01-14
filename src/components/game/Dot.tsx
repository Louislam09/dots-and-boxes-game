// components/game/Dot.tsx - SVG-based dot with rotating preview + hover state

import React, { memo, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { Circle, G } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

// Create animated SVG components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isPreview: boolean;
  isHovered?: boolean;
  isInteractive: boolean;
  dotSize: number;
  previewColor?: string;
}

export const Dot = memo(function Dot({
  dot,
  isSelected,
  isPreview,
  isHovered,
  isInteractive,
  dotSize,
  previewColor,
}: DotProps) {
  // Animation values
  const dashOffset = useSharedValue(0);
  const scale = useSharedValue(1);

  // Dot radius
  const baseRadius = dotSize / 2;

  // Preview ring calculations
  const ringRadius = baseRadius + 10;
  const circumference = useMemo(() => 2 * Math.PI * ringRadius, [ringRadius]);
  const dashLength = circumference / 8;

  // Rotation animation using strokeDashoffset
  useEffect(() => {
    if (isPreview) {
      dashOffset.value = 0;
      dashOffset.value = withRepeat(
        withTiming(circumference, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(dashOffset);
      dashOffset.value = 0;
    }

    return () => {
      cancelAnimation(dashOffset);
    };
  }, [isPreview, circumference]);

  // Scale animation for hover/selected state
  useEffect(() => {
    if (isHovered) {
      scale.value = withSpring(1.5, { damping: 10, stiffness: 180 });
    } else if (isSelected) {
      scale.value = withSpring(1.4, { damping: 10, stiffness: 180 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [isHovered, isSelected]);

  // Animated props for the main dot
  const animatedDotProps = useAnimatedProps(() => ({
    r: baseRadius * scale.value,
  }));

  // Animated props for the preview ring rotation (using strokeDashoffset)
  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  // Animated props for hover glow
  const animatedGlowProps = useAnimatedProps(() => ({
    r: (baseRadius + 12) * scale.value,
    opacity: interpolate(scale.value, [1, 1.5], [0, 0.3]),
  }));

  // Colors based on state
  const dotFill = isHovered
    ? (previewColor || COLORS.accent.primary)
    : isSelected
      ? COLORS.game.dotActive
      : COLORS.game.dot;

  const strokeColor = isHovered || isSelected
    ? (previewColor || COLORS.accent.primary)
    : COLORS.glass.borderLight;

  const dotOpacity = isInteractive ? 1 : 0.6;

  return (
    <G>
      {/* Shadow for depth */}
      <Circle
        cx={dot.x}
        cy={dot.y + 2}
        r={baseRadius}
        fill="rgba(0,0,0,0.2)"
      />

      {/* Hover glow ring */}
      {(isHovered || isSelected) && (
        <AnimatedCircle
          cx={dot.x}
          cy={dot.y}
          fill={previewColor || COLORS.accent.primary}
          animatedProps={animatedGlowProps}
        />
      )}

      {/* Rotating preview ring - uses strokeDashoffset animation */}
      {isPreview && !isHovered && (
        <AnimatedCircle
          cx={dot.x}
          cy={dot.y}
          r={ringRadius}
          stroke={previewColor || COLORS.accent.primary}
          strokeWidth={3}
          strokeDasharray={`${dashLength},${dashLength}`}
          fill="none"
          opacity={0.7}
          animatedProps={animatedRingProps}
        />
      )}

      {/* Main dot with border */}
      <AnimatedCircle
        cx={dot.x}
        cy={dot.y}
        fill={dotFill}
        stroke={strokeColor}
        strokeWidth={2}
        opacity={dotOpacity}
        animatedProps={animatedDotProps}
      />
    </G>
  );
});

export default Dot;
