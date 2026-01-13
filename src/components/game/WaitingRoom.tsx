// components/game/WaitingRoom.tsx - Waiting room / lobby component (Clean)

import React, { useEffect } from 'react';
import { View, Text, Share, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { Avatar } from '../ui/Avatar';
import { GlassCard } from '../ui/GlassCard';
import { GlowButton } from '../ui/GlowButton';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { GAME_CONFIG } from '../../constants/game';
import { COLORS, getPlayerColor } from '../../constants/colors';

interface WaitingRoomProps {
  onLeave: () => void;
}

export function WaitingRoom({ onLeave }: WaitingRoomProps) {
  const { gameState } = useGame();
  const { user } = useAuth();
  const { startGame } = useSocket();

  // Animation values
  const contentOpacity = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!gameState) return null;

  const { roomCode, players, gameMode } = gameState;
  const maxPlayers = GAME_CONFIG.MAX_PLAYERS[gameMode];
  const isOwner = players.find((p) => p.isOwner)?.id === user?.id;
  const canStart = players.length >= 2;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Dots & Boxes game!\n\nRoom Code: ${roomCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
  };

  return (
    <Animated.View style={[styles.container, contentAnimatedStyle]}>
      {/* Room Code Card */}
      <GlassCard variant="elevated" style={styles.codeCard}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <View style={styles.codeRow}>
          {roomCode.split('').map((char, index) => (
            <View key={index} style={styles.codeCharBox}>
              <Text style={styles.codeChar}>{char}</Text>
            </View>
          ))}
        </View>
        <View style={styles.codeActions}>
          <TouchableOpacity onPress={handleCopyCode} style={styles.codeAction}>
            <Text style={styles.codeActionText}>Copy</Text>
          </TouchableOpacity>
          <View style={styles.codeDivider} />
          <TouchableOpacity onPress={handleShare} style={styles.codeAction}>
            <Text style={styles.codeActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Game Mode Badge */}
      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>
          {gameMode === '1vs1' ? '1 vs 1' : '3 Players'}
        </Text>
      </View>

      {/* Players Section */}
      <GlassCard style={styles.playersCard}>
        <View style={styles.playersHeader}>
          <Text style={styles.playersTitle}>Players</Text>
          <Text style={styles.playersCount}>
            {players.length} / {maxPlayers}
          </Text>
        </View>

        <View style={styles.playersList}>
          {players.map((player, index) => (
            <View
              key={player.id}
              style={[
                styles.playerRow,
                { borderLeftColor: getPlayerColor(index) },
              ]}
            >
              <Avatar name={player.name} size="md" />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {player.id === user?.id ? `${player.name} (You)` : player.name}
                </Text>
                {player.isOwner && (
                  <Text style={styles.playerRole}>Host</Text>
                )}
              </View>
              <Text style={styles.readyText}>Ready</Text>
            </View>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.emptySlot}>
              <Animated.View style={[styles.emptyPulse, pulseAnimatedStyle]} />
              <View style={styles.emptyAvatar}>
                <Text style={styles.emptyAvatarText}>?</Text>
              </View>
              <Text style={styles.emptyText}>Waiting for player...</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Action Section */}
      <View style={styles.actions}>
        {isOwner ? (
          <>
            <GlowButton
              title={canStart ? 'Start Game' : 'Waiting for players...'}
              onPress={startGame}
              disabled={!canStart}
              fullWidth
              size="lg"
            />
            {!canStart && (
              <Text style={styles.actionHint}>
                Need at least 2 players to start
              </Text>
            )}
          </>
        ) : (
          <View style={styles.waitingBanner}>
            <Text style={styles.waitingText}>
              Waiting for host to start...
            </Text>
          </View>
        )}

        <GlowButton
          title="Leave Room"
          onPress={onLeave}
          variant="ghost"
          fullWidth
          size="md"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  codeCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  codeCharBox: {
    width: 40,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.accent.primary,
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeAction: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  codeActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  codeDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.glass.border,
  },
  modeBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  modeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  playersCard: {
    flex: 1,
    marginBottom: 16,
  },
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  playersCount: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  playersList: {
    gap: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  playerRole: {
    fontSize: 12,
    color: COLORS.accent.primary,
    marginTop: 2,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.status.success,
  },
  emptySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.glass.border,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyPulse: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.accent.primary,
  },
  emptyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontSize: 16,
    color: COLORS.text.muted,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.muted,
    marginLeft: 12,
  },
  actions: {
    gap: 12,
  },
  actionHint: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
  waitingBanner: {
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default WaitingRoom;
