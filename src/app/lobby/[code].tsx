// app/lobby/[code].tsx - Game lobby screen

import { useEffect, useState } from 'react';
import { View, Text, BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { roomService } from '../../services/pocketbase';
import { WaitingRoom } from '../../components/game/WaitingRoom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Toast, useToast } from '../../components/ui/Toast';

export default function LobbyScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const { gameState } = useGame();
  const { leaveRoom } = useSocket();
  const { toast, showError, hideToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if game has started
    if (gameState?.status === 'playing') {
      router.replace(`/game/${code}`);
    }
  }, [gameState?.status, code, router]);

  useEffect(() => {
    // Initial load
    setIsLoading(false);
  }, []);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleLeave();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleLeave = async () => {
    leaveRoom();
    
    if (gameState?.roomId) {
      await roomService.leaveRoom(gameState.roomId);
    }
    
    router.replace('/home');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading lobby..." />
      </View>
    );
  }

  if (!gameState) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-4">
        <Text className="text-xl font-bold text-gray-900 mb-2">Room Not Found</Text>
        <Text className="text-gray-500 text-center mb-6">
          The room may have been closed or expired.
        </Text>
        <Text
          className="text-indigo-600 font-semibold"
          onPress={() => router.replace('/home')}
        >
          Go Home
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <WaitingRoom onLeave={handleLeave} />
      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

