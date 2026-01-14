// app/join-room.tsx - Join room screen (Clean)

import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { Toast, useToast, GlassCard, GlowButton } from '../components/ui';
import { roomService } from '../services/pocketbase';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { gameStorage } from '../utils/storage';
import { validators, sanitizeRoomCode } from '../utils/validators';
import { COLORS } from '../constants/colors';

const CODE_LENGTH = 6;

export default function JoinRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showError, hideToast } = useToast();
  const { joinRoom } = useSocket();
  const { initGame } = useGame();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const codeContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleCodeChange = (index: number, value: string) => {
    const sanitized = sanitizeRoomCode(value).slice(0, 1);
    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);
    setError(undefined);

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const roomCode = code.join('');
  const isCodeComplete = roomCode.length === CODE_LENGTH;

  const handleJoin = async () => {
    if (!validators.roomCode(roomCode)) {
      setError('Please enter a valid 6-character code');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await roomService.joinRoom(roomCode);

      if (result.success && result.room) {
        const gm = result.room.gameMode as '1vs1' | '3players' | '4players';
        
        // Save active room for reconnection
        await gameStorage.saveActiveRoom({
          roomCode: result.room.code,
          roomId: result.room.id,
          gameMode: gm,
          status: 'waiting',
        });
        
        // Initialize game with room's board settings
        initGame(result.room.code, result.room.id, gm, {
          gridRows: result.room.boardRows || 5,
          gridCols: result.room.boardCols || 4,
          theme: result.room.theme,
        });
        
        // Join room with board settings
        joinRoom({
          roomCode: result.room.code,
          roomId: result.room.id,
          gameMode: gm,
          maxPlayers: result.room.maxPlayers,
          gridRows: result.room.boardRows,
          gridCols: result.room.boardCols,
          theme: result.room.theme,
        });
        
        router.push(`/lobby/${result.room.code}`);
      } else {
        setError(result.error || 'Room not found');
        triggerShake();
      }
    } catch (error) {
      showError('An unexpected error occurred');
      triggerShake();
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
        <Text style={styles.headerTitle}>Join Room</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎮</Text>
        </View>

        <Text style={styles.title}>Enter Room Code</Text>
        <Text style={styles.subtitle}>
          Ask the host for the 6-character code
        </Text>

        {/* Code Input */}
        <Animated.View style={[styles.codeContainer, codeContainerStyle]}>
          {Array(CODE_LENGTH).fill(0).map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeBox,
                code[index] && styles.codeBoxFilled,
                error && styles.codeBoxError,
              ]}
            >
              <TextInput
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.codeInput}
                value={code[index]}
                onChangeText={(value) => handleCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                maxLength={1}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                selectTextOnFocus
              />
            </View>
          ))}
        </Animated.View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Join Button */}
        <GlowButton
          title="Join Room"
          onPress={handleJoin}
          loading={isLoading}
          disabled={!isCodeComplete}
          fullWidth
          size="lg"
        />

        {/* Help */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            Room codes are 6 characters like "ABC123"
          </Text>
        </View>
      </Animated.View>

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  codeBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.glass.background,
    borderWidth: 1.5,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: COLORS.accent.primary,
  },
  codeBoxError: {
    borderColor: COLORS.status.error,
  },
  codeInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.status.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: COLORS.text.muted,
  },
});
