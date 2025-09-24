import { useState, useEffect, useRef, useCallback } from 'react';

interface VADOptions {
  threshold?: number;
  minSilenceDuration?: number;
  minSpeechDuration?: number;
  sampleRate?: number;
}

interface VADResult {
  isUserSpeaking: boolean;
  energyLevel: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  overlapDetected: boolean;
}

export const useVoiceActivityDetection = (
  aiIsSpeaking: boolean = false,
  options: VADOptions = {}
): VADResult => {
  const {
    threshold = 0.01,
    minSilenceDuration = 500,
    minSpeechDuration = 100,
    sampleRate = 24000
  } = options;

  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [overlapDetected, setOverlapDetected] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const silenceTimerRef = useRef<NodeJS.Timeout>();
  const speechTimerRef = useRef<NodeJS.Timeout>();
  const lastSpeechTimeRef = useRef<number>(0);

  const calculateRMSEnergy = useCallback((audioData: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      const sample = (audioData[i] - 128) / 128;
      sum += sample * sample;
    }
    return Math.sqrt(sum / audioData.length);
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const energy = calculateRMSEnergy(dataArray);
    setEnergyLevel(energy);

    const isSpeaking = energy > threshold;
    const currentTime = Date.now();

    // Detect overlap when user speaks while AI is speaking
    if (isSpeaking && aiIsSpeaking && !overlapDetected) {
      console.log('🔄 Overlap detected - User speaking while AI is speaking');
      setOverlapDetected(true);
    }

    // Reset overlap detection when AI stops speaking
    if (!aiIsSpeaking && overlapDetected) {
      setOverlapDetected(false);
    }

    if (isSpeaking) {
      lastSpeechTimeRef.current = currentTime;
      
      // Clear silence timer if speech detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = undefined;
      }

      // Start speech timer for minimum duration
      if (!isUserSpeaking && !speechTimerRef.current) {
        speechTimerRef.current = setTimeout(() => {
          setIsUserSpeaking(true);
          speechTimerRef.current = undefined;
        }, minSpeechDuration);
      }
    } else {
      // Clear speech timer if silence detected
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
        speechTimerRef.current = undefined;
      }

      // Start silence timer for minimum duration
      if (isUserSpeaking && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
          silenceTimerRef.current = undefined;
        }, minSilenceDuration);
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [threshold, minSilenceDuration, minSpeechDuration, isUserSpeaking, aiIsSpeaking, overlapDetected, calculateRMSEnergy]);

  const startListening = useCallback(async () => {
    try {
      // Stop any existing analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new AudioContext({ sampleRate });
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Configure analyser
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;

      // Connect audio source to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start analysis
      console.log('🎤 VAD: Started voice activity detection');
      analyzeAudio();
    } catch (error) {
      console.error('Error starting VAD:', error);
      throw error;
    }
  }, [sampleRate, analyzeAudio]);

  const stopListening = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = undefined;
    }
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = undefined;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsUserSpeaking(false);
    setEnergyLevel(0);
    setOverlapDetected(false);
    
    console.log('🎤 VAD: Stopped voice activity detection');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isUserSpeaking,
    energyLevel,
    startListening,
    stopListening,
    overlapDetected
  };
};