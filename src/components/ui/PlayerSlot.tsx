// components/ui/PlayerSlot.tsx - Player type toggle (Human/AI)

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import type { PlayerType } from '../../types/game';

interface PlayerSlotProps {
  playerIndex: number;
  playerType: PlayerType;
  color: string;
  onToggle: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const PlayerSlot = memo(function PlayerSlot({
  playerIndex,
  playerType,
  color,
  onToggle,
  disabled = false,
  isActive = true,
}: PlayerSlotProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isHuman = playerType === 'human';

  return (
    <TouchableOpacity
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.container,
          { borderColor: isActive ? color : COLORS.glass.border },
          !isActive && styles.containerInactive,
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isActive ? color : COLORS.glass.background },
          ]}
        >
          <Text style={styles.icon}>{isHuman ? '👤' : '🤖'}</Text>
        </View>
        <Text style={[styles.label, !isActive && styles.labelInactive]}>
          P{playerIndex + 1}
        </Text>
        <Text style={[styles.typeLabel, !isActive && styles.typeLabelInactive]}>
          {isHuman ? 'Human' : 'AI'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

interface PlayerSlotsRowProps {
  playerCount: number;
  playerTypes: PlayerType[];
  onTogglePlayer: (index: number) => void;
  colors: string[];
  maxPlayers?: number;
}

export const PlayerSlotsRow = memo(function PlayerSlotsRow({
  playerCount,
  playerTypes,
  onTogglePlayer,
  colors,
  maxPlayers = 4,
}: PlayerSlotsRowProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxPlayers }).map((_, index) => {
        const isActive = index < playerCount;
        return (
          <PlayerSlot
            key={index}
            playerIndex={index}
            playerType={playerTypes[index] || 'human'}
            color={colors[index % colors.length]}
            onToggle={() => onTogglePlayer(index)}
            disabled={!isActive}
            isActive={isActive}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: COLORS.glass.background,
    minWidth: 64,
  },
  containerInactive: {
    opacity: 0.4,
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  labelInactive: {
    color: COLORS.text.muted,
  },
  typeLabel: {
    fontSize: 9,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  typeLabelInactive: {
    color: COLORS.text.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
});

export default PlayerSlot;

