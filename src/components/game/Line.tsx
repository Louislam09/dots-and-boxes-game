// components/game/Line.tsx - Line components (Edge-based, Optimized)

import React, { memo, useMemo } from 'react';
import { Line as SvgLine } from 'react-native-svg';
import { COLORS } from '../../constants/colors';
import { edgeToCoords } from '../../constants/game';
import type { Edge, Line as LineType, Dot as DotType } from '../../types/game';

// ============ EDGE-BASED LINE (FAST) ============
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

  return (
    <SvgLine
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      stroke={edge.color}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      opacity={edge.isOptimistic ? 0.7 : 0.9}
    />
  );
});

// ============ EDGE-BASED PREVIEW LINE ============

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

  return (
    <SvgLine
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      stroke={color || COLORS.accent.primary}
      strokeWidth={lineWidth - 1}
      strokeLinecap="round"
      strokeDasharray="8,4"
      opacity={0.5}
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

  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={line.color}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      opacity={0.9}
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
  return (
    <SvgLine
      x1={dot1.x}
      y1={dot1.y}
      x2={dot2.x}
      y2={dot2.y}
      stroke={color || COLORS.accent.primary}
      strokeWidth={lineWidth}
      strokeLinecap="round"
      strokeDasharray="8,4"
      opacity={0.5}
    />
  );
});

export default Line;
