// contexts/index.tsx - Re-export contexts and combined provider

export { AuthProvider, useAuth } from './AuthContext';
export { SocketProvider, useSocket } from './SocketContext';
export { GameProvider, useGame } from './GameContext';
export { SoundProvider, useSound } from './SoundContext';

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { SocketProvider } from './SocketContext';
import { GameProvider } from './GameContext';
import { SoundProvider } from './SoundContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combined provider that wraps all app contexts
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <SoundProvider>
        <SocketProvider>
          <GameProvider>{children}</GameProvider>
        </SocketProvider>
      </SoundProvider>
    </AuthProvider>
  );
}

