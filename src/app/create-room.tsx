// app/create-room.tsx - Create room/game screen with game settings

import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';
import { 
  Input, 
  Toast, 
  useToast, 
  GlowButton,
  ArrowSelector,
  PlayerSlotsRow,
  SettingsCard,
} from '../components/ui';
import { roomService } from '../services/pocketbase';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { gameStorage } from '../utils/storage';
import { COLORS } from '../constants/colors';
import { 
  GAME_CONFIG,
  BOARD_SIZES, 
  DEFAULT_BOARD_SIZE,
  BOARD_THEMES, 
  THEME_LIST,
  DEFAULT_THEME,
  AI_DIFFICULTIES,
} from '../constants/game';
import type { 
  PlayMode, 
  PlayerType, 
  AIDifficulty, 
  BoardSizeOption, 
  BoardTheme,
  GameMode,
} from '../types/game';

const PLAYER_OPTIONS = [2, 3, 4];

export default function CreateRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showError, hideToast } = useToast();
  const { joinRoom } = useSocket();
  const { initGame } = useGame();

  // Play mode toggle
  const [playMode, setPlayMode] = useState<PlayMode>('local');

  // Local game settings
  const [playerCount, setPlayerCount] = useState(2);
  const [playerTypes, setPlayerTypes] = useState<PlayerType[]>(['human', 'human', 'human', 'human']);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');

  // Shared settings
  const [boardSize, setBoardSize] = useState<BoardSizeOption>(DEFAULT_BOARD_SIZE);
  const [theme, setTheme] = useState<BoardTheme>(DEFAULT_THEME);

  // Online settings
  const [roomName, setRoomName] = useState('');

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

  // Check if any player is AI
  const hasAIPlayer = useMemo(() => {
    return playerTypes.slice(0, playerCount).some(type => type === 'ai');
  }, [playerTypes, playerCount]);

  // Handle player count change
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    // Reset player types when count changes
    const newTypes = [...playerTypes];
    for (let i = 0; i < count; i++) {
      if (newTypes[i] === undefined) {
        newTypes[i] = 'human';
      }
    }
    setPlayerTypes(newTypes);
  };

  // Handle player type toggle
  const handleTogglePlayerType = (index: number) => {
    if (index >= playerCount) return;
    
    const newTypes = [...playerTypes];
    newTypes[index] = newTypes[index] === 'human' ? 'ai' : 'human';
    setPlayerTypes(newTypes);
  };

  // Handle board size change
  const handleBoardSizeChange = (size: BoardSizeOption) => {
    setBoardSize(size);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: BoardTheme) => {
    setTheme(newTheme);
  };

  // Handle create room (online mode)
  const handleCreateOnline = async () => {
    setIsLoading(true);

    try {
      // Determine game mode based on player count
      let gameMode: GameMode;
      if (playerCount === 2) gameMode = '1vs1';
      else if (playerCount === 3) gameMode = '3players';
      else gameMode = '4players';
      
      const result = await roomService.createRoom({
        name: roomName.trim() || undefined,
        gameMode,
        maxPlayers: playerCount,
        boardRows: boardSize.rows,
        boardCols: boardSize.cols,
        theme,
      });

      if (result.success && result.room) {
        // Save active room for reconnection
        await gameStorage.saveActiveRoom({
          roomCode: result.room.code,
          roomId: result.room.id,
          gameMode,
          status: 'waiting',
        });

        // Initialize game with board settings
        initGame(result.room.code, result.room.id, gameMode, {
          gridRows: boardSize.rows,
          gridCols: boardSize.cols,
          theme,
        });
        
        // Join room with board settings
        joinRoom({
          roomCode: result.room.code,
          roomId: result.room.id,
          gameMode,
          maxPlayers: playerCount,
          gridRows: boardSize.rows,
          gridCols: boardSize.cols,
          theme,
        });
        
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

  // Handle start local game
  const handleStartLocal = () => {
    // TODO: Implement local game start with AI
    // For now, show a message
    showError('Local play coming soon! Use Online mode for now.');
  };

  // Handle primary button press
  const handlePrimaryAction = () => {
    if (playMode === 'online') {
      handleCreateOnline();
    } else {
      handleStartLocal();
    }
  };

  const currentTheme = BOARD_THEMES[theme];

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
        <Text style={styles.headerTitle}>Create Game</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentAnimatedStyle}>
          {/* Play Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                playMode === 'local' && styles.modeButtonActive,
              ]}
              onPress={() => setPlayMode('local')}
            >
              <Text style={styles.modeIcon}>🎮</Text>
              <Text style={[
                styles.modeText,
                playMode === 'local' && styles.modeTextActive,
              ]}>
                Local
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeButton,
                playMode === 'online' && styles.modeButtonActive,
              ]}
              onPress={() => setPlayMode('online')}
            >
              <Text style={styles.modeIcon}>🌐</Text>
              <Text style={[
                styles.modeText,
                playMode === 'online' && styles.modeTextActive,
              ]}>
                Online
              </Text>
            </TouchableOpacity>
          </View>

          {/* Online-only: Room Name */}
          {playMode === 'online' && (
            <SettingsCard title="Room Name" icon="📝">
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Enter a fun name (optional)..."
                  value={roomName}
                  onChangeText={setRoomName}
                  maxLength={50}
                />
              </View>
            </SettingsCard>
          )}

          {/* Choose Players */}
          <SettingsCard 
            title="Choose Players" 
            icon="👥"
            helperText={playMode === 'local' ? "Press a player to toggle Human/AI" : undefined}
          >
            <ArrowSelector
              value={playerCount}
              options={PLAYER_OPTIONS}
              onChange={handlePlayerCountChange}
              renderValue={(count) => `${count} Players`}
            />
            
            {playMode === 'local' && (
              <PlayerSlotsRow
                playerCount={playerCount}
                playerTypes={playerTypes}
                onTogglePlayer={handleTogglePlayerType}
                colors={GAME_CONFIG.PLAYER_COLORS}
                maxPlayers={4}
              />
            )}
          </SettingsCard>

          {/* AI Difficulty - only show for local mode with AI */}
          {playMode === 'local' && hasAIPlayer && (
            <SettingsCard title="AI Difficulty" icon="🤖">
              <ArrowSelector
                value={aiDifficulty}
                options={AI_DIFFICULTIES.map(d => d.key)}
                onChange={setAIDifficulty}
                renderValue={(diff) => AI_DIFFICULTIES.find(d => d.key === diff)?.label || diff}
                subtitle={AI_DIFFICULTIES.find(d => d.key === aiDifficulty)?.description}
              />
            </SettingsCard>
          )}

          {/* Board Size */}
          <SettingsCard title="Board Size" icon="📐">
            <ArrowSelector
              value={boardSize}
              options={BOARD_SIZES}
              onChange={handleBoardSizeChange}
              renderValue={(size) => size.label}
              subtitle={boardSize.category === 'rectangular' ? 'Rectangular' : 'Square'}
            />
            
            {/* Mini board preview */}
            <View style={styles.boardPreview}>
              <View style={[
                styles.boardPreviewInner,
                { 
                  aspectRatio: boardSize.cols / boardSize.rows,
                  backgroundColor: currentTheme.board,
                },
              ]}>
                <View style={styles.boardPreviewGrid}>
                  {Array.from({ length: Math.min(boardSize.rows, 5) }).map((_, row) => (
                    <View key={row} style={styles.boardPreviewRow}>
                      {Array.from({ length: Math.min(boardSize.cols, 5) }).map((_, col) => (
                        <View 
                          key={col} 
                          style={[
                            styles.boardPreviewDot,
                            { backgroundColor: currentTheme.primary },
                          ]} 
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </SettingsCard>

          {/* Theme */}
          <SettingsCard title="Theme" icon="🎨">
            <ArrowSelector
              value={theme}
              options={THEME_LIST}
              onChange={handleThemeChange}
              renderValue={(t) => BOARD_THEMES[t].name}
            />
            
            {/* Theme color preview */}
            <View style={styles.themePreview}>
              <View style={[styles.themeColor, { backgroundColor: currentTheme.primary }]} />
              <View style={[styles.themeColor, { backgroundColor: currentTheme.secondary }]} />
              <View style={[styles.themeColor, { backgroundColor: currentTheme.accent }]} />
              <View style={[
                styles.themeColor, 
                styles.themeColorBoard,
                { backgroundColor: currentTheme.board },
              ]} />
            </View>
          </SettingsCard>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
        <GlowButton
          title={playMode === 'online' ? 'Create Room' : 'Start Game'}
          onPress={handlePrimaryAction}
          loading={isLoading}
          fullWidth
          size="lg"
        />
      </View>

      <Toast {...toast} onHide={hideToast} />
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass.background,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.accent.primary,
  },
  modeIcon: {
    fontSize: 18,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  modeTextActive: {
    color: COLORS.background.primary,
  },
  inputWrapper: {
    width: '100%',
  },
  boardPreview: {
    marginTop: 16,
    alignItems: 'center',
  },
  boardPreviewInner: {
    width: 100,
    maxHeight: 80,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardPreviewGrid: {
    gap: 6,
  },
  boardPreviewRow: {
    flexDirection: 'row',
    gap: 6,
  },
  boardPreviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  themePreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  themeColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  themeColorBoard: {
    borderWidth: 2,
    borderColor: COLORS.glass.border,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
});
