// app/create-room.tsx - Create room screen (Clean)

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Input, Toast, useToast, GlassCard, GlowButton } from '../components/ui';
import { roomService } from '../services/pocketbase';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { COLORS } from '../constants/colors';
import type { GameMode } from '../types/game';

export default function CreateRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showError, hideToast } = useToast();
  const { joinRoom } = useSocket();
  const { initGame } = useGame();

  const [roomName, setRoomName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('1vs1');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await roomService.createRoom({
        name: roomName.trim() || undefined,
        gameMode,
      });

      if (result.success && result.room) {
        initGame(result.room.code, result.room.id, gameMode);
        joinRoom(result.room.code, result.room.id);
        router.push(`/lobby/${result.room.code}`);
      } else {
        showError(result.error || 'Failed to create room');
      }
    } catch (error) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Room</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Room Name Input */}
        <GlassCard variant="elevated" style={styles.card}>
          <Input
            label="Room Name (Optional)"
            placeholder="Enter a fun name..."
            value={roomName}
            onChangeText={setRoomName}
            maxLength={50}
          />

          {/* Game Mode Selection */}
          <Text style={styles.sectionLabel}>Game Mode</Text>
          <View style={styles.modeContainer}>
            <GameModeCard
              title="1 vs 1"
              description="Classic duel"
              icon="⚔️"
              players="2"
              selected={gameMode === '1vs1'}
              onPress={() => setGameMode('1vs1')}
            />
            <GameModeCard
              title="3 Players"
              description="Triple battle"
              icon="👥"
              players="3"
              selected={gameMode === '3players'}
              onPress={() => setGameMode('3players')}
            />
          </View>
        </GlassCard>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 A unique code will be generated for friends to join.
          </Text>
        </View>

        {/* Create Button */}
        <GlowButton
          title="Create Room"
          onPress={handleCreate}
          loading={isLoading}
          fullWidth
          size="lg"
        />
      </Animated.View>

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

interface GameModeCardProps {
  title: string;
  description: string;
  icon: string;
  players: string;
  selected: boolean;
  onPress: () => void;
}

function GameModeCard({ title, description, icon, players, selected, onPress }: GameModeCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.modeCard,
          selected && styles.modeCardSelected,
          animatedStyle,
        ]}
      >
        <Text style={styles.modeIcon}>{icon}</Text>
        <Text style={[styles.modeTitle, selected && styles.modeTitleSelected]}>{title}</Text>
        <Text style={styles.modeDescription}>{description}</Text>
        <View style={[styles.playersBadge, selected && styles.playersBadgeSelected]}>
          <Text style={[styles.playersText, selected && styles.playersTextSelected]}>{players} Players</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 12,
    marginTop: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1.5,
    borderColor: COLORS.glass.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  modeCardSelected: {
    borderColor: COLORS.accent.primary,
    backgroundColor: 'rgba(0, 217, 255, 0.08)',
  },
  modeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  modeTitleSelected: {
    color: COLORS.accent.primary,
  },
  modeDescription: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 12,
  },
  playersBadge: {
    backgroundColor: COLORS.glass.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  playersBadgeSelected: {
    backgroundColor: COLORS.accent.primary,
  },
  playersText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  playersTextSelected: {
    color: COLORS.background.primary,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
