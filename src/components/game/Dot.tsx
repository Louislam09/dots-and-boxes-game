// components/game/Dot.tsx - Individual dot component (Optimized)

import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
}

const DOT_SIZE = 22;
const HIT_AREA = 44; // Larger touch area for easier tapping

export const Dot = memo(function Dot({ dot, isSelected, isInteractive, onPress }: DotProps) {
  const handlePress = useCallback(() => {
    if (isInteractive) {
      onPress(dot);
    }
  }, [isInteractive, onPress, dot]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive}
      style={[
        styles.touchArea,
        {
          left: dot.x - HIT_AREA / 2,
          top: dot.y - HIT_AREA / 2,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          isSelected && styles.dotSelected,
          !isInteractive && styles.dotDisabled,
        ]}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  touchArea: {
    position: 'absolute',
    width: HIT_AREA,
    height: HIT_AREA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.game.dot,
    borderWidth: 2,
    borderColor: COLORS.glass.borderLight,
  },
  dotSelected: {
    backgroundColor: COLORS.game.dotActive,
    borderColor: COLORS.accent.primary,
    transform: [{ scale: 1.3 }],
  },
  dotDisabled: {
    opacity: 0.6,
  },
});

export default Dot;
