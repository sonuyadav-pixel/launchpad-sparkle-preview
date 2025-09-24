import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  duration: number;
  volume: number;
}

interface TTSOptions {
  voice?: string;
  volume?: number;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onPlaybackPause?: () => void;
  onPlaybackResume?: () => void;
}

interface AdvancedTTSResult {
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  getState: () => TTSState;
  isPlaying: boolean;
  isPaused: boolean;
  canResume: boolean;
}

export const useAdvancedTTS = (): AdvancedTTSResult => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBufferRef = useRef<ArrayBuffer | null>(null);
  const pausePositionRef = useRef<number>(0);
  const currentOptionsRef = useRef<TTSOptions>({});
  const resumeDataRef = useRef<{
    remainingText: string;
    originalText: string;
    pausedAt: number;
  } | null>(null);

  const createAudioFromBase64 = useCallback((base64Audio: string): Promise<HTMLAudioElement> => {
    return new Promise((resolve, reject) => {
      try {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        audio.volume = volume;
        
        audio.addEventListener('loadeddata', () => resolve(audio));
        audio.addEventListener('error', (e) => reject(e));
        
        // Store buffer for potential resume operations
        audioBufferRef.current = bytes.buffer;
      } catch (error) {
        reject(error);
      }
    });
  }, [volume]);

  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    try {
      setIsPlaying(true);
      setIsPaused(false);
      currentOptionsRef.current = options;

      console.log('🔊 TTS: Starting speech synthesis for:', text.substring(0, 50) + '...');

      // Call ElevenLabs TTS via Supabase edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: options.voice || 'alloy'
        }
      });

      if (error) throw error;

      // Create audio element from base64 response
      const audio = await createAudioFromBase64(data.audioContent);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setIsPaused(false);
        options.onPlaybackStart?.();
        console.log('🔊 TTS: Playback started');
      });

      audio.addEventListener('pause', () => {
        if (!audio.ended) {
          setIsPaused(true);
          pausePositionRef.current = audio.currentTime;
          options.onPlaybackPause?.();
          console.log('⏸️ TTS: Playback paused at', audio.currentTime);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
        pausePositionRef.current = 0;
        resumeDataRef.current = null;
        options.onPlaybackEnd?.();
        console.log('🔊 TTS: Playback completed');
        
        // Cleanup
        URL.revokeObjectURL(audio.src);
      });

      audio.addEventListener('error', (e) => {
        console.error('🔊 TTS: Playback error:', e);
        setIsPlaying(false);
        setIsPaused(false);
        toast({
          title: "Audio Error",
          description: "Failed to play audio response",
          variant: "destructive",
        });
      });

      // Start playback
      await audio.play();
      
    } catch (error) {
      console.error('🔊 TTS: Error in speak function:', error);
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    }
  }, [createAudioFromBase64, toast]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying && !isPaused) {
      audioRef.current.pause();
      console.log('⏸️ TTS: Manual pause triggered');
    }
  }, [isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.currentTime = pausePositionRef.current;
      audioRef.current.play().then(() => {
        setIsPaused(false);
        setIsPlaying(true);
        currentOptionsRef.current.onPlaybackResume?.();
        console.log('▶️ TTS: Playback resumed from', pausePositionRef.current);
      }).catch((error) => {
        console.error('🔊 TTS: Resume error:', error);
      });
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      pausePositionRef.current = 0;
      resumeDataRef.current = null;
      
      // Cleanup
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
      
      console.log('🛑 TTS: Playback stopped');
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    console.log('🔊 TTS: Volume set to', clampedVolume);
  }, []);

  const getState = useCallback((): TTSState => {
    const currentTime = audioRef.current?.currentTime || 0;
    const duration = audioRef.current?.duration || 0;
    
    return {
      isPlaying,
      isPaused,
      currentPosition: isPaused ? pausePositionRef.current : currentTime,
      duration,
      volume
    };
  }, [isPlaying, isPaused, volume]);

  const canResume = isPaused && audioRef.current !== null;

  return {
    speak,
    pause,
    resume,
    stop,
    setVolume,
    getState,
    isPlaying,
    isPaused,
    canResume
  };
};