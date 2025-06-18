import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

// Sound file mappings
const SOUNDS = {
  radar: require('@/assets/sounds/radar.mp3'),
  // Add more sounds here as needed
  // explosion: require('@/assets/sounds/explosion.mp3'),
  // success: require('@/assets/sounds/success.mp3'),
  // warning: require('@/assets/sounds/warning.mp3'),
} as const;

export type SoundType = keyof typeof SOUNDS;

class SoundManager {
  private static instance: SoundManager;
  private loadedSounds: Map<string, Audio.Sound> = new Map();
  private isAudioEnabled: boolean = true;

  private constructor() { }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Enable or disable all audio
  public setAudioEnabled(enabled: boolean): void {
    this.isAudioEnabled = enabled;
  }

  public getAudioEnabled(): boolean {
    return this.isAudioEnabled;
  }

  // Play a sound by type
  public async playSound(soundType: SoundType, options?: {
    volume?: number;
    shouldLoop?: boolean;
    rate?: number;
  }): Promise<void> {
    if (!this.isAudioEnabled) {
      return;
    }

    try {
      const soundFile = SOUNDS[soundType];
      if (!soundFile) {
        console.warn(`Sound type "${soundType}" not found`);
        return;
      }

      // Create and play the sound
      const { sound } = await Audio.Sound.createAsync(soundFile, {
        shouldPlay: true,
        volume: options?.volume ?? 1.0,
        isLooping: options?.shouldLoop ?? false,
        rate: options?.rate ?? 1.0,
      });

      // Store reference for cleanup
      const soundId = `${soundType}_${Date.now()}`;
      this.loadedSounds.set(soundId, sound);

      // Auto-cleanup when sound finishes
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish && !status.isLooping) {
          this.unloadSound(soundId);
        }
      });

    } catch (error) {
      console.warn(`Error playing sound "${soundType}":`, error);
    }
  }

  // Stop and unload a specific sound
  private async unloadSound(soundId: string): Promise<void> {
    try {
      const sound = this.loadedSounds.get(soundId);
      if (sound) {
        await sound.unloadAsync();
        this.loadedSounds.delete(soundId);
      }
    } catch (error) {
      console.warn(`Error unloading sound "${soundId}":`, error);
    }
  }

  // Stop and unload all sounds
  public async unloadAllSounds(): Promise<void> {
    const unloadPromises = Array.from(this.loadedSounds.keys()).map(soundId =>
      this.unloadSound(soundId)
    );
    await Promise.all(unloadPromises);
  }

  // Play radar sound (convenience method)
  public async playRadarSound(): Promise<void> {
    return this.playSound('radar');
  }

  // Add more convenience methods for common sounds
  // public async playExplosionSound(): Promise<void> {
  //   return this.playSound('explosion');
  // }

  // public async playSuccessSound(): Promise<void> {
  //   return this.playSound('success');
  // }

  // public async playWarningSound(): Promise<void> {
  //   return this.playSound('warning');
  // }
}

// Export singleton instance and convenience functions
export const soundManager = SoundManager.getInstance();

// Convenience functions for easy importing
export const playSound = (soundType: SoundType, options?: {
  volume?: number;
  shouldLoop?: boolean;
  rate?: number;
}) => soundManager.playSound(soundType, options);

export const playRadarSound = () => soundManager.playRadarSound();

export const setAudioEnabled = (enabled: boolean) => soundManager.setAudioEnabled(enabled);

export const getAudioEnabled = () => soundManager.getAudioEnabled();

export const unloadAllSounds = () => soundManager.unloadAllSounds();

// Initialize audio mode
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  playThroughEarpieceAndroid: false,
}); 