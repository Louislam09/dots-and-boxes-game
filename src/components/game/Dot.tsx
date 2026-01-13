// components/game/Dot.tsx - Individual dot component (Clean)

import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import type { Dot as DotType } from '../../types/game';

interface DotProps {
  dot: DotType;
  isSelected: boolean;
  isInteractive: boolean;
  onPress: (dot: DotType) => void;
}

const DOT_SIZE = 18;
const HIT_SLOP = 10;

export function Dot({ dot, isSelected, isInteractive, onPress }: DotProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(1.3, { damping: 10, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  }, [isSelected]);

  const handlePress = () => {
    if (isInteractive) {
      onPress(dot);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isInteractive}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP, left: HIT_SLOP, right: HIT_SLOP }}
      style={[
        styles.container,
        {
          left: dot.x - DOT_SIZE / 2,
          top: dot.y - DOT_SIZE / 2,
        },
      ]}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.dot,
          isSelected && styles.dotSelected,
          !isInteractive && styles.dotDisabled,
          animatedStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE - 4,
    height: DOT_SIZE - 4,
    borderRadius: (DOT_SIZE - 4) / 2,
    backgroundColor: COLORS.game.dot,
    borderWidth: 2,
    borderColor: COLORS.glass.borderLight,
  },
  dotSelected: {
    backgroundColor: COLORS.game.dotActive,
    borderColor: COLORS.accent.primary,
  },
  dotDisabled: {
    opacity: 0.6,
  },
});

export default Dot;
