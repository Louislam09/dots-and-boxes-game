// components/game/WaitingRoom.tsx - Waiting room / lobby component

import React from 'react';
import { View, Text, Share } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { GAME_CONFIG } from '../../constants/game';

interface WaitingRoomProps {
  onLeave: () => void;
}

export function WaitingRoom({ onLeave }: WaitingRoomProps) {
  const { gameState } = useGame();
  const { user } = useAuth();
  const { startGame } = useSocket();

  if (!gameState) return null;

  const { roomCode, players, gameMode } = gameState;
  const maxPlayers = GAME_CONFIG.MAX_PLAYERS[gameMode];
  const isOwner = players.find((p) => p.isOwner)?.id === user?.id;
  const canStart = players.length >= 2;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Dots & Boxes game! 🎮\n\nRoom Code: ${roomCode}\n\nDownload the app and enter this code to play!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View className="flex-1 p-4">
      {/* Room Code Card */}
      <Card variant="elevated" className="mb-4">
        <View className="items-center py-4">
          <Text className="text-gray-500 text-sm uppercase font-medium mb-2">
            Room Code
          </Text>
          <Text className="text-4xl font-bold tracking-widest text-indigo-600">
            {roomCode}
          </Text>
          <Button
            title="Share Code"
            onPress={handleShare}
            variant="ghost"
            size="sm"
            icon={<Text>📤</Text>}
            className="mt-3"
          />
        </View>
      </Card>

      {/* Game Mode */}
      <Card className="mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-600 font-medium">Game Mode</Text>
          <View className="bg-indigo-100 px-3 py-1 rounded-full">
            <Text className="text-indigo-700 font-semibold">
              {gameMode === '1vs1' ? '1 vs 1' : '3 Players'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Players */}
      <Card className="mb-4 flex-1">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900">Players</Text>
          <Text className="text-gray-500">
            {players.length} / {maxPlayers}
          </Text>
        </View>

        {/* Player List */}
        <View className="gap-3">
          {players.map((player, index) => (
            <View
              key={player.id}
              className="flex-row items-center py-3 px-4 bg-gray-50 rounded-xl"
            >
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: GAME_CONFIG.PLAYER_COLORS[index] }}
              />
              <Avatar name={player.name} size="sm" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-gray-800">
                  {player.id === user?.id ? `${player.name} (You)` : player.name}
                </Text>
                {player.isOwner && (
                  <Text className="text-xs text-indigo-600">Host</Text>
                )}
              </View>
              <Text className="text-green-500 font-medium">Ready ✓</Text>
            </View>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
            <View
              key={`empty-${i}`}
              className="flex-row items-center py-3 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
            >
              <View className="w-10 h-10 rounded-full bg-gray-200 mr-3 items-center justify-center">
                <Text className="text-gray-400">?</Text>
              </View>
              <Text className="text-gray-400 font-medium">
                Waiting for player...
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Actions */}
      <View className="gap-3">
        {isOwner ? (
          <>
            <Button
              title={canStart ? 'Start Game' : 'Waiting for players...'}
              onPress={startGame}
              disabled={!canStart}
              fullWidth
              icon={<Text>{canStart ? '🎮' : '⏳'}</Text>}
            />
            <Text className="text-center text-gray-500 text-sm">
              {canStart
                ? 'All players ready! Start when ready.'
                : `Need at least 2 players to start`}
            </Text>
          </>
        ) : (
          <View className="bg-blue-50 rounded-xl py-4 px-4">
            <Text className="text-blue-700 text-center font-medium">
              ⏳ Waiting for host to start the game...
            </Text>
          </View>
        )}

        <Button
          title="Leave Room"
          onPress={onLeave}
          variant="outline"
          fullWidth
        />
      </View>
    </View>
  );
}

export default WaitingRoom;

