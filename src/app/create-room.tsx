// app/create-room.tsx - Create room screen

import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Card, Toast, useToast } from '../components/ui';
import { roomService } from '../services/pocketbase';
import { useSocket } from '../contexts/SocketContext';
import { useGame } from '../contexts/GameContext';
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

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await roomService.createRoom({
        name: roomName.trim() || undefined,
        gameMode,
      });

      if (result.success && result.room) {
        // Initialize game state
        initGame(result.room.code, result.room.id, gameMode);
        
        // Join socket room
        joinRoom(result.room.code, result.room.id);
        
        // Navigate to lobby
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
        <Text className="text-2xl font-bold text-gray-900">Create Room</Text>
      </View>

      {/* Form */}
      <Card className="mb-6">
        <Input
          label="Room Name (Optional)"
          placeholder="My awesome game"
          value={roomName}
          onChangeText={setRoomName}
          maxLength={50}
        />

        {/* Game Mode Selection */}
        <Text className="text-sm font-medium text-gray-700 mb-3">Game Mode</Text>
        <View className="flex-row gap-3 mb-4">
          <GameModeCard
            title="1 vs 1"
            description="Classic head-to-head"
            icon="👥"
            selected={gameMode === '1vs1'}
            onPress={() => setGameMode('1vs1')}
          />
          <GameModeCard
            title="3 Players"
            description="Triple the fun"
            icon="👥👤"
            selected={gameMode === '3players'}
            onPress={() => setGameMode('3players')}
          />
        </View>
      </Card>

      {/* Info */}
      <Card variant="outlined" className="mb-6">
        <View className="flex-row items-start">
          <Text className="text-xl mr-3">💡</Text>
          <View className="flex-1">
            <Text className="text-gray-700 font-medium">How it works</Text>
            <Text className="text-gray-500 text-sm mt-1">
              A room code will be generated that you can share with friends.
              They can join using this code to play together!
            </Text>
          </View>
        </View>
      </Card>

      {/* Create Button */}
      <Button
        title="Create Room"
        onPress={handleCreate}
        loading={isLoading}
        fullWidth
        size="lg"
      />

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

interface GameModeCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}

function GameModeCard({ title, description, icon, selected, onPress }: GameModeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        flex-1 p-4 rounded-xl border-2
        ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}
      `}
    >
      <Text className="text-2xl mb-2">{icon}</Text>
      <Text className={`font-bold ${selected ? 'text-indigo-700' : 'text-gray-900'}`}>
        {title}
      </Text>
      <Text className="text-gray-500 text-sm">{description}</Text>
    </TouchableOpacity>
  );
}

