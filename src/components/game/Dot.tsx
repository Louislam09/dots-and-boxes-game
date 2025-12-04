// components/game/Dot.tsx - Interactive dot component

import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { GAME_CONFIG } from '../../constants/game';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
}

export function Dot({ dot, isSelected, isInteractive, onPress }: DotProps) {
  const { DOT_SIZE, DOT_HIT_AREA } = GAME_CONFIG;

  const handlePress = () => {
    if (isInteractive) {
      onPress(dot);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isInteractive}
      activeOpacity={0.7}
      style={{
        position: 'absolute',
        left: dot.x - DOT_HIT_AREA / 2,
        top: dot.y - DOT_HIT_AREA / 2,
        width: DOT_HIT_AREA,
        height: DOT_HIT_AREA,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: isSelected ? DOT_SIZE + 4 : DOT_SIZE,
          height: isSelected ? DOT_SIZE + 4 : DOT_SIZE,
          borderRadius: (isSelected ? DOT_SIZE + 4 : DOT_SIZE) / 2,
          backgroundColor: isSelected ? COLORS.primary.DEFAULT : COLORS.game.dot,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0.15,
          shadowRadius: isSelected ? 4 : 2,
          elevation: isSelected ? 4 : 2,
        }}
      />
    </TouchableOpacity>
  );
}

export default Dot;

