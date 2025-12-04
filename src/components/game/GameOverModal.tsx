// components/game/GameOverModal.tsx - Game over modal component

import React from 'react';
import { View, Text } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { GAME_CONFIG } from '../../constants/game';

interface GameOverModalProps {
  visible: boolean;
  onClose: () => void;
  onLeaveRoom: () => void;
}

export function GameOverModal({
  visible,
  onClose,
  onLeaveRoom,
}: GameOverModalProps) {
  const { gameState } = useGame();
  const { user } = useAuth();
  const { requestPlayAgain } = useSocket();

  if (!gameState) return null;

  const { winner, isDraw, players } = gameState;
  const isWinner = winner?.id === user?.id;

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Calculate experience earned
  const myScore = players.find((p) => p.id === user?.id)?.score ?? 0;
  const { EXPERIENCE } = GAME_CONFIG;
  let expEarned = myScore * EXPERIENCE.PER_SQUARE;
  if (isDraw) {
    expEarned += EXPERIENCE.DRAW_BONUS;
  } else if (isWinner) {
    expEarned += EXPERIENCE.WIN_BONUS;
  } else {
    expEarned += EXPERIENCE.LOSS_BONUS;
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Game Over"
      closeOnBackdrop={false}
      showCloseButton={false}
    >
      {/* Result Banner */}
      <View
        className={`
          py-6 px-4 rounded-2xl mb-4
          ${isDraw ? 'bg-amber-100' : isWinner ? 'bg-emerald-100' : 'bg-gray-100'}
        `}
      >
        <Text className="text-4xl text-center mb-2">
          {isDraw ? '🤝' : isWinner ? '🏆' : '😢'}
        </Text>
        <Text
          className={`
            text-2xl font-bold text-center
            ${isDraw ? 'text-amber-700' : isWinner ? 'text-emerald-700' : 'text-gray-700'}
          `}
        >
          {isDraw ? "It's a Draw!" : isWinner ? 'You Won!' : 'You Lost'}
        </Text>
        {winner && !isDraw && (
          <Text className="text-center text-gray-600 mt-1">
            {isWinner ? 'Congratulations! 🎉' : `${winner.name} wins this round`}
          </Text>
        )}
      </View>

      {/* Leaderboard */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Final Scores
        </Text>
        {sortedPlayers.map((player, index) => (
          <View
            key={player.id}
            className={`
              flex-row items-center py-3 px-4 rounded-xl mb-2
              ${player.id === user?.id ? 'bg-indigo-50' : 'bg-gray-50'}
            `}
          >
            <Text className="text-lg font-bold text-gray-400 w-6">
              {index + 1}
            </Text>
            <View
              className="w-3 h-3 rounded-full mx-2"
              style={{ backgroundColor: player.color }}
            />
            <Avatar name={player.name} size="sm" />
            <Text className="flex-1 ml-3 font-semibold text-gray-800">
              {player.id === user?.id ? 'You' : player.name}
            </Text>
            <Text
              className="text-xl font-bold"
              style={{ color: player.color }}
            >
              {player.score}
            </Text>
          </View>
        ))}
      </View>

      {/* Experience Earned */}
      <View className="bg-indigo-50 rounded-xl py-3 px-4 mb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-indigo-700 font-medium">Experience Earned</Text>
          <Text className="text-indigo-700 font-bold text-lg">+{expEarned} XP</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="gap-3">
        <Button
          title="Play Again"
          onPress={() => {
            requestPlayAgain();
            onClose();
          }}
          variant="primary"
          fullWidth
          icon={<Text>🔄</Text>}
        />
        <Button
          title="Leave Room"
          onPress={onLeaveRoom}
          variant="outline"
          fullWidth
        />
      </View>
    </Modal>
  );
}

export default GameOverModal;

