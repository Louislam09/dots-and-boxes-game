// components/game/Line.tsx - Line components (Dark Gaming Theme)

import React from 'react';
import { Line as SvgLine } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import type { Line as LineType, Dot as DotType } from '../../types/game';

interface LineProps {
  line: LineType;
  dots: DotType[];
}

export function Line({ line, dots }: LineProps) {
  const dot1 = dots.find((d) => d.id === line.dot1Id);
  const dot2 = dots.find((d) => d.id === line.dot2Id);

  if (!dot1 || !dot2) return null;

  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={line.color}
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.9}
    />
  );
}

interface PreviewLineProps {
  dot1: DotType;
  dot2: DotType;
  color?: string;
}

export function PreviewLine({ dot1, dot2, color }: PreviewLineProps) {
  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={color || COLORS.accent.primary}
      strokeWidth={4}
      strokeLinecap="round"
      strokeDasharray="8,4"
      opacity={0.4}
    />
  );
}

export default Line;
