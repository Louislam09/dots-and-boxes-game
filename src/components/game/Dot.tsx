// components/game/Dot.tsx - Individual dot component (Optimized, Responsive)

import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
  dotSize: number;  // Responsive size passed from parent
  hitArea: number;  // Responsive hit area passed from parent
}

export const Dot = memo(function Dot({ 
  dot, 
  isSelected, 
  isInteractive, 
  onPress,
  dotSize,
  hitArea,
}: DotProps) {
  const handlePress = useCallback(() => {
    if (isInteractive) {
      onPress(dot);
    }
  }, [isInteractive, onPress, dot]);

  // Memoize styles to avoid recreation on every render
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
    transform: isSelected ? [{ scale: 1.25 }] : [],
    opacity: isInteractive ? 1 : 0.6,
  }), [dotSize, isSelected, isInteractive]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      style={touchAreaStyle}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      <View style={dotStyle} />
    </Pressable>
  );
});

export default Dot;
