// app/game/[code].tsx - Active game screen

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../contexts/GameContext';
import { useSocket } from '../../contexts/SocketContext';
import { useSound } from '../../contexts/SoundContext';
import { roomService } from '../../services/pocketbase';
import { GameBoard, ScoreBoard, TurnBanner, GameOverModal } from '../../components/game';
import { Toast, useToast } from '../../components/ui/Toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function GameScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const { gameState, clearSelection } = useGame();
  const { leaveRoom } = useSocket();
  const { triggerHaptic, playSound } = useSound();
  const { toast, showInfo, hideToast } = useToast();

  const [showGameOver, setShowGameOver] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - 32, 400);

  // Show game over modal when game finishes
  useEffect(() => {
    if (gameState?.status === 'finished') {
      setShowGameOver(true);
      triggerHaptic(gameState.winner ? 'success' : 'warning');
    }
  }, [gameState?.status]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      showInfo('Press leave button to exit');
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

  if (!gameState) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading game..." />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleLeave}
          className="w-10 h-10 bg-white rounded-full items-center justify-center"
        >
          <Text>←</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <Text className="text-gray-500 mr-2">Room:</Text>
          <Text className="font-bold text-gray-900">{code}</Text>
        </View>

        <View className="w-10" />
      </View>

      {/* Turn Banner */}
      <View className="px-4 mb-4">
        <TurnBanner />
      </View>

      {/* Score Board */}
      <View className="px-4 mb-4">
        <ScoreBoard />
      </View>

      {/* Game Board */}
      <View className="flex-1 items-center justify-center px-4">
        <GameBoard size={boardSize} />
      </View>

      {/* Helper Text */}
      <View className="px-4 py-4">
        <Text className="text-center text-gray-500 text-sm">
          {gameState.status === 'playing'
            ? 'Tap two adjacent dots to draw a line'
            : 'Waiting for game to start...'}
        </Text>
      </View>

      {/* Game Over Modal */}
      <GameOverModal
        visible={showGameOver}
        onClose={() => setShowGameOver(false)}
        onLeaveRoom={handleLeave}
      />

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
}

