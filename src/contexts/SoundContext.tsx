// contexts/SoundContext.tsx - Sound and haptics context

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { settingsStorage, UserSettings } from '../utils/storage';

interface SoundContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  playSound: (sound: SoundType) => Promise<void>;
  triggerHaptic: (type: HapticType) => void;
}

type SoundType = 'move' | 'complete' | 'error' | 'winner' | 'join' | 'click';
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

// Sound file mapping
const SOUND_FILES: Record<SoundType, string | null> = {
  move: null, // Will be loaded from assets
  complete: null,
  error: null,
  winner: null,
  join: null,
  click: null,
};

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
  const [sounds, setSounds] = useState<Map<SoundType, Audio.Sound>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await settingsStorage.getSettings();
      setSettings(saved);
    };
    loadSettings();
  }, []);

  // Load sound files
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        // Note: In a real implementation, you would load actual sound files here
        // For now, we'll skip this as the sound files don't exist yet
        // Example:
        // const { sound: moveSound } = await Audio.Sound.createAsync(
        //   require('../../assets/sounds/move.mp3')
        // );
        // sounds.set('move', moveSound);

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    // Cleanup sounds on unmount
    return () => {
      sounds.forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await settingsStorage.updateSettings(updates);
  }, [settings]);

  // Play a sound effect
  const playSound = useCallback(
    async (type: SoundType) => {
      if (!settings.soundEnabled) return;

      try {
        const sound = sounds.get(type);
        if (sound) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        }
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [settings.soundEnabled, sounds]
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

export default SoundContext;

