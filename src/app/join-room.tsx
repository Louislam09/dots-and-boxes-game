// app/join-room.tsx - Join room screen

import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Card, Toast, useToast } from '../components/ui';
import { roomService } from '../services/pocketbase';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
import { validators, sanitizeRoomCode } from '../utils/validators';

export default function JoinRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showError, hideToast } = useToast();
  const { joinRoom } = useSocket();
  const { initGame } = useGame();

  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleCodeChange = (text: string) => {
    // Auto-uppercase and remove invalid characters
    const sanitized = sanitizeRoomCode(text).slice(0, 6);
    setRoomCode(sanitized);
    setError(undefined);
  };

  const handleJoin = async () => {
    // Validate
    if (!validators.roomCode(roomCode)) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await roomService.joinRoom(roomCode);

      if (result.success && result.room) {
        // Initialize game state
        initGame(result.room.code, result.room.id, result.room.gameMode as '1vs1' | '3players');
        
        // Join socket room
        joinRoom(result.room.code, result.room.id);
        
        // Navigate to lobby
        router.push(`/lobby/${result.room.code}`);
      } else {
        setError(result.error || 'Room not found');
      }
    } catch (error) {
      showError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className="flex-1 bg-gray-50 px-4"
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3"
        >
          <Text className="text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Join Room</Text>
      </View>

      {/* Form */}
      <Card className="mb-6">
        <Text className="text-gray-600 mb-4">
          Enter the 6-character room code to join a game
        </Text>

        <Input
          label="Room Code"
          placeholder="ABC123"
          value={roomCode}
          onChangeText={handleCodeChange}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={6}
          error={error}
          inputClassName="text-center text-2xl tracking-widest font-bold"
        />

        <Button
          title="Join Room"
          onPress={handleJoin}
          loading={isLoading}
          disabled={roomCode.length !== 6}
          fullWidth
          size="lg"
        />
      </Card>

      {/* Help */}
      <Card variant="outlined">
        <View className="flex-row items-start">
          <Text className="text-xl mr-3">❓</Text>
          <View className="flex-1">
            <Text className="text-gray-700 font-medium">Need a code?</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Ask the room host to share their room code with you.
              Codes are 6 characters, like "ABC123".
            </Text>
          </View>
        </View>
      </Card>

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

