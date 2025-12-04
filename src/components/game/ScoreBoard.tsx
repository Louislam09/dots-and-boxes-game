// components/game/ScoreBoard.tsx - Score display component

import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Player } from '../../types/game';

interface ScoreBoardProps {
  compact?: boolean;
}

export function ScoreBoard({ compact = false }: ScoreBoardProps) {
  const { gameState } = useGame();
  const { user } = useAuth();

  if (!gameState) return null;

  const { players, currentTurnPlayerId } = gameState;

  if (compact) {
    return (
      <View className="flex-row justify-around py-3 px-4 bg-white rounded-xl">
        {players.map((player) => (
          <CompactPlayerScore
            key={player.id}
            player={player}
            isCurrentTurn={player.id === currentTurnPlayerId}
            isMe={player.id === user?.id}
          />
        ))}
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <View className="flex-row justify-around">
        {players.map((player, index) => (
          <React.Fragment key={player.id}>
            <PlayerScore
              player={player}
              isCurrentTurn={player.id === currentTurnPlayerId}
              isMe={player.id === user?.id}
            />
            {index < players.length - 1 && (
              <View className="w-px bg-gray-200 mx-2" />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

interface PlayerScoreProps {
  player: Player;
  isCurrentTurn: boolean;
  isMe: boolean;
}

function PlayerScore({ player, isCurrentTurn, isMe }: PlayerScoreProps) {
  return (
    <View
      className={`
        items-center py-2 px-3 rounded-xl flex-1
        ${isCurrentTurn ? 'bg-gray-50' : ''}
      `}
    >
      <View className="relative">
        <Avatar name={player.name} size="md" />
        {isCurrentTurn && (
          <View
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: player.color }}
          >
            <Text className="text-white text-xs">▶</Text>
          </View>
        )}
      </View>

      <Text
        className={`
          mt-2 font-semibold text-sm
          ${isCurrentTurn ? 'text-gray-900' : 'text-gray-600'}
        `}
        numberOfLines={1}
      >
        {isMe ? 'You' : player.name}
      </Text>

      <View
        className="mt-1 px-3 py-1 rounded-full"
        style={{ backgroundColor: player.color + '20' }}
      >
        <Text
          className="text-xl font-bold"
          style={{ color: player.color }}
        >
          {player.score}
        </Text>
      </View>

      {!player.isConnected && (
        <Text className="text-xs text-orange-500 mt-1">Disconnected</Text>
      )}
    </View>
  );
}

function CompactPlayerScore({ player, isCurrentTurn, isMe }: PlayerScoreProps) {
  return (
    <View
      className={`
        flex-row items-center px-3 py-1 rounded-lg
        ${isCurrentTurn ? 'bg-gray-100' : ''}
      `}
    >
      <View
        className="w-3 h-3 rounded-full mr-2"
        style={{ backgroundColor: player.color }}
      />
      <Text
        className={`
          font-medium mr-2
          ${isCurrentTurn ? 'text-gray-900' : 'text-gray-600'}
        `}
      >
        {isMe ? 'You' : player.name}:
      </Text>
      <Text
        className="font-bold text-lg"
        style={{ color: player.color }}
      >
        {player.score}
      </Text>
      {isCurrentTurn && (
        <Text className="ml-1 text-xs">👈</Text>
      )}
    </View>
  );
}

export default ScoreBoard;

