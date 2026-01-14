// components/game/Line.tsx - Line components with draw animation (Edge-based, Optimized)

import React, { memo, useMemo, useEffect } from 'react';
import { Line as SvgLine } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { edgeToCoords } from '../../constants/game';
import type { Edge, Line as LineType, Dot as DotType } from '../../types/game';

// Create animated SVG line
const AnimatedLine = Animated.createAnimatedComponent(SvgLine);

// ============ EDGE-BASED LINE WITH DRAW ANIMATION ============
// Pure math positioning - no dot lookups needed

interface EdgeLineProps {
  edge: Edge;
  spacing: number;
  padding: number;
  lineWidth: number;
}

export const EdgeLine = memo(function EdgeLine({
  edge,
  spacing,
  padding,
  lineWidth,
}: EdgeLineProps) {
  // Pure math - O(1) coordinate calculation
  const coords = useMemo(
    () => edgeToCoords(edge, spacing, padding),
    [edge.row, edge.col, edge.dir, spacing, padding]
  );

  // Calculate line length for dash animation
  const lineLength = spacing;

  // Animation values
  const dashOffset = useSharedValue(lineLength);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Draw animation: line appears to draw from start to end
    dashOffset.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    // Fade in
    opacity.value = withTiming(edge.isOptimistic ? 0.7 : 0.95, {
      duration: 150,
    });

    // Glow effect on new lines
    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }, []);

  // When optimistic status changes, update opacity
  useEffect(() => {
    if (!edge.isOptimistic) {
      opacity.value = withTiming(0.95, { duration: 150 });
    }
  }, [edge.isOptimistic]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
    opacity: opacity.value,
  }));

  const glowAnimatedProps = useAnimatedProps(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <>
      {/* Glow effect layer */}
      <AnimatedLine
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke={edge.color}
        strokeWidth={lineWidth + 8}
        strokeLinecap="round"
        animatedProps={glowAnimatedProps}
      />
      {/* Main line with draw animation */}
      <AnimatedLine
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke={edge.color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        strokeDasharray={lineLength}
        animatedProps={animatedProps}
      />
    </>
  );
});

// ============ EDGE-BASED PREVIEW LINE WITH PULSE ============

interface EdgePreviewLineProps {
  row: number;
  col: number;
  dir: 'H' | 'V';
  spacing: number;
  padding: number;
  lineWidth: number;
  color?: string;
}

export const EdgePreviewLine = memo(function EdgePreviewLine({
  row,
  col,
  dir,
  spacing,
  padding,
  lineWidth,
  color,
}: EdgePreviewLineProps) {
  const coords = useMemo(
    () => edgeToCoords({ row, col, dir }, spacing, padding),
    [row, col, dir, spacing, padding]
  );

  // Subtle pulse animation for preview
  const opacity = useSharedValue(0.3);
  const dashOffset = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(0.5, { duration: 150 });

    // Animated dash movement
    dashOffset.value = withTiming(-24, {
      duration: 800,
      easing: Easing.linear,
    });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <AnimatedLine
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      stroke={color || COLORS.accent.primary}
      strokeWidth={lineWidth - 1}
      strokeLinecap="round"
      strokeDasharray="8,4"
      animatedProps={animatedProps}
    />
  );
});

// ============ LEGACY DOT-BASED LINE (BACKWARD COMPATIBLE) ============

interface LineProps {
  line: LineType;
  dots: DotType[];
  lineWidth?: number;
}

export const Line = memo(function Line({ line, dots, lineWidth = 5 }: LineProps) {
  const dot1 = dots[line.dot1Id];
  const dot2 = dots[line.dot2Id];

  if (!dot1 || !dot2) return null;

  // Calculate line length
  const dx = dot2.x - dot1.x;
  const dy = dot2.y - dot1.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);

  // Animation values
  const dashOffset = useSharedValue(lineLength);
  const opacity = useSharedValue(0);

  useEffect(() => {
    dashOffset.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(0.9, { duration: 150 });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
    opacity: opacity.value,
  }));

  return (
    <AnimatedLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={line.color}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      strokeDasharray={lineLength}
      animatedProps={animatedProps}
    />
  );
});

interface PreviewLineProps {
  dot1: DotType;
  dot2: DotType;
  color?: string;
  lineWidth?: number;
}

export const PreviewLine = memo(function PreviewLine({
  dot1,
  dot2,
  color,
  lineWidth = 4,
}: PreviewLineProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withTiming(0.5, { duration: 150 });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={color || COLORS.accent.primary}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      strokeDasharray="8,4"
      animatedProps={animatedProps}
    />
  );
});

export default Line;
