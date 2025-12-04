// components/game/Line.tsx - Line between dots component

import React from 'react';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { GAME_CONFIG } from '../../constants/game';
import type { Dot, Line as LineType } from '../../types/game';

interface LineProps {
  line: LineType;
  dots: Dot[];
  animated?: boolean;
}

export function Line({ line, dots, animated = false }: LineProps) {
  const { LINE_WIDTH } = GAME_CONFIG;
  
  const dot1 = dots[line.dot1Id];
  const dot2 = dots[line.dot2Id];
  
  if (!dot1 || !dot2) return null;

  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={line.color}
      strokeWidth={LINE_WIDTH}
      strokeLinecap="round"
    />
  );
}

// Preview line (shown when selecting second dot)
interface PreviewLineProps {
  dot1: Dot;
  dot2: Dot;
  color?: string;
}

export function PreviewLine({ dot1, dot2, color = '#9CA3AF' }: PreviewLineProps) {
  const { LINE_WIDTH } = GAME_CONFIG;

  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={color}
      strokeWidth={LINE_WIDTH}
      strokeLinecap="round"
      strokeDasharray="4,4"
      opacity={0.5}
    />
  );
}

export default Line;

