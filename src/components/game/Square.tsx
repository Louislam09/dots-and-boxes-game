// components/game/Square.tsx - Completed square component

import React from 'react';
import { Rect } from 'react-native-svg';
import { GAME_CONFIG } from '../../constants/game';
import type { Dot, Square as SquareType } from '../../types/game';

interface SquareProps {
  square: SquareType;
  dots: Dot[];
  spacing: number;
}

export function Square({ square, dots, spacing }: SquareProps) {
  if (!square.isComplete || !square.color) return null;

  const { GRID_SIZE, BOARD_PADDING } = GAME_CONFIG;
  const topLeftDot = dots[square.topLeftDotId];
  
  if (!topLeftDot) return null;

  // Calculate fill opacity based on color
  const fillColor = square.color + '40'; // 25% opacity

  return (
    <Rect
      x={topLeftDot.x}
      y={topLeftDot.y}
      width={spacing}
      height={spacing}
      fill={fillColor}
      stroke={square.color}
      strokeWidth={1}
      opacity={0.8}
    />
  );
}

export default Square;

