// components/game/Square.tsx - Completed square component (Dark Gaming Theme)

import React, { useEffect, useMemo } from 'react';
import { Rect, Text as SvgText, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import type { Square as SquareType, Dot as DotType, Player } from '../../types/game';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedG = Animated.createAnimatedComponent(G);

interface SquareProps {
  square: SquareType;
  dots: DotType[];
  spacing: number;
  players?: Player[];
}

// Extract initials from player name (e.g., "John Doe" -> "JD", "Alice" -> "A")
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Square({ square, dots, spacing, players }: SquareProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // All hooks must be called before any early returns
  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  // Get player info for initials and color
  const playerInfo = useMemo(() => {
    if (!square.completedBy || !players) return null;
    const player = players.find(p => p.id === square.completedBy);
    if (!player) return null;
    return {
      initials: getInitials(player.name),
      color: player.color,
    };
  }, [square.completedBy, players]);

  // Use square.color if available, fallback to player color
  const fillColor = square.color || playerInfo?.color;

  useEffect(() => {
    if (square.isComplete) {
      opacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.6, { duration: 150 })
      );
      scale.value = withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [square.isComplete]);

  // Early returns must come AFTER all hooks
  if (!square.isComplete || !fillColor) return null;

  const topLeftDot = dots[square.topLeftDotId];
  if (!topLeftDot) return null;

  const padding = 2;
  const squareSize = spacing - padding * 2;
  const centerX = topLeftDot.x + padding + squareSize / 2;
  const centerY = topLeftDot.y + padding + squareSize / 2;
  const fontSize = Math.max(10, Math.min(squareSize * 0.5, 16));

  return (
    <AnimatedG animatedProps={animatedProps}>
      <Rect
        x={topLeftDot.x + padding}
        y={topLeftDot.y + padding}
        width={squareSize}
        height={squareSize}
        fill={fillColor}
        rx={4}
        ry={4}
      />
      {playerInfo?.initials && (
        <SvgText
          x={centerX}
          y={centerY}
          fontSize={fontSize}
          fontWeight="bold"
          fill="rgba(255, 255, 255, 0.9)"
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {playerInfo.initials}
        </SvgText>
      )}
    </AnimatedG>
  );
}

export default Square;
