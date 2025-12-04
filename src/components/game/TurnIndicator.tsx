// components/game/TurnIndicator.tsx - Turn indicator component

import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

interface TurnIndicatorProps {
  className?: string;
}

export function TurnIndicator({ className = '' }: TurnIndicatorProps) {
  const { gameState, isMyTurn } = useGame();
  const { user } = useAuth();

  if (!gameState || gameState.status !== 'playing') return null;

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentTurnPlayerId
  );

  if (!currentPlayer) return null;

  return (
    <View
      className={`
        flex-row items-center justify-center
        px-4 py-2 rounded-full
        ${isMyTurn ? 'bg-emerald-100' : 'bg-gray-100'}
        ${className}
      `}
    >
      <View
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: currentPlayer.color }}
      />
      <Text
        className={`
          font-semibold
          ${isMyTurn ? 'text-emerald-700' : 'text-gray-600'}
        `}
      >
        {isMyTurn ? "Your Turn!" : `${currentPlayer.name}'s Turn`}
      </Text>
      {isMyTurn && (
        <Text className="ml-2 animate-pulse">✨</Text>
      )}
    </View>
  );
}

// Large turn banner (shown at top of game screen)
interface TurnBannerProps {
  className?: string;
}

export function TurnBanner({ className = '' }: TurnBannerProps) {
  const { gameState, isMyTurn } = useGame();
  const { user } = useAuth();

  if (!gameState) return null;

  const { status, winner, isDraw } = gameState;

  if (status === 'finished') {
    if (isDraw) {
      return (
        <View className={`bg-amber-500 py-3 px-4 rounded-xl ${className}`}>
          <Text className="text-white text-center font-bold text-lg">
            🤝 It's a Draw!
          </Text>
        </View>
      );
    }

    const isWinner = winner?.id === user?.id;
    return (
      <View
        className={`
          py-3 px-4 rounded-xl
          ${isWinner ? 'bg-emerald-500' : 'bg-gray-500'}
          ${className}
        `}
      >
        <Text className="text-white text-center font-bold text-lg">
          {isWinner ? '🎉 You Won!' : `${winner?.name} Wins!`}
        </Text>
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View className={`bg-blue-500 py-3 px-4 rounded-xl ${className}`}>
        <Text className="text-white text-center font-bold text-lg">
          ⏳ Waiting for players...
        </Text>
      </View>
    );
  }

  const currentPlayer = gameState.players.find(
    (p) => p.id === gameState.currentTurnPlayerId
  );

  return (
    <View
      className={`
        py-3 px-4 rounded-xl
        ${isMyTurn ? 'bg-emerald-500' : 'bg-indigo-500'}
        ${className}
      `}
    >
      <View className="flex-row items-center justify-center">
        {currentPlayer && (
          <View
            className="w-4 h-4 rounded-full mr-2 border-2 border-white"
            style={{ backgroundColor: currentPlayer.color }}
          />
        )}
        <Text className="text-white text-center font-bold text-lg">
          {isMyTurn ? '🎮 Your Turn - Tap two dots!' : `Waiting for ${currentPlayer?.name}...`}
        </Text>
      </View>
    </View>
  );
}

export default TurnIndicator;

