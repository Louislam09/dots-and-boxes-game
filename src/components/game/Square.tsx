// components/game/Square.tsx - Completed square component (Dark Gaming Theme)

import React, { useEffect } from 'react';
import { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { GAME_CONFIG } from '../../constants/game';
import type { Square as SquareType, Dot as DotType } from '../../types/game';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface SquareProps {
  square: SquareType;
  dots: DotType[];
  spacing: number;
}

export function Square({ square, dots, spacing }: SquareProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

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

  if (!square.isComplete || !square.color) return null;

  const topLeftDot = dots[square.topLeftDotId];
  if (!topLeftDot) return null;

  const { BOARD_PADDING } = GAME_CONFIG;
  const padding = 2;

  const animatedProps = useAnimatedProps(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedRect
      x={topLeftDot.x + padding}
      y={topLeftDot.y + padding}
      width={spacing - padding * 2}
      height={spacing - padding * 2}
      fill={square.color}
      rx={4}
      ry={4}
      animatedProps={animatedProps}
    />
  );
}

export default Square;
