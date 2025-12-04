// contexts/SoundContext.tsx - Sound and haptics context

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import * as Haptics from 'expo-haptics';
import { settingsStorage, UserSettings } from '../utils/storage';

// Note: expo-audio's useAudioPlayer hook must be used at component level
// For a simple sound system, we'll use haptics as primary feedback
// and can add audio players in specific components when needed

interface SoundContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  playSound: (sound: SoundType) => void;
  triggerHaptic: (type: HapticType) => void;
}

type SoundType = 'move' | 'complete' | 'error' | 'winner' | 'join' | 'click';
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [settings, setSettings] = useState<UserSettings>({
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await settingsStorage.getSettings();
      setSettings(saved);
    };
    loadSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await settingsStorage.updateSettings(updates);
  }, [settings]);

  // Play a sound effect using haptics as feedback
  // Note: For actual audio, use useAudioPlayer hook in components
  // Example in a component:
  // const player = useAudioPlayer(require('../assets/sounds/move.mp3'));
  // player.play();
  const playSound = useCallback(
    (type: SoundType) => {
      if (!settings.soundEnabled) return;

      // Use haptic feedback as audio substitute until sound files are added
      try {
        switch (type) {
          case 'move':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'complete':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case 'winner':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'join':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'click':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
        }
      } catch (error) {
        // Haptics may not be available on all devices/web
        console.warn('Sound/Haptic feedback not available:', error);
      }
    },
    [settings.soundEnabled]
  );

  // Trigger haptic feedback
  const triggerHaptic = useCallback(
    (type: HapticType) => {
      if (!settings.vibrationEnabled) return;

      try {
        switch (type) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch (error) {
        // Haptics may not be available on all devices
        console.warn('Haptics not available:', error);
      }
    },
    [settings.vibrationEnabled]
  );

  const value: SoundContextValue = {
    settings,
    updateSettings,
    playSound,
    triggerHaptic,
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

// Helper hook for playing sounds with expo-audio in components
// Usage example in a component:
//
// import { useAudioPlayer } from 'expo-audio';
// const moveSound = useAudioPlayer(require('../assets/sounds/move.mp3'));
// moveSound.play();

export default SoundContext;
