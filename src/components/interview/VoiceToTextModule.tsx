import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square, Play, Pause, Download } from 'lucide-react';

interface VoiceToTextModuleProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean, confidence?: number) => void;
  isActive: boolean;
  className?: string;
}

const VoiceToTextModule: React.FC<VoiceToTextModuleProps> = ({
  onTranscriptUpdate,
  isActive,
  className
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            onTranscriptUpdate(transcript, true, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        setCurrentTranscript(currentText);
        
        if (!finalTranscript && interimTranscript) {
          onTranscriptUpdate(interimTranscript, false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          toast({
            title: "No Speech Detected",
            description: "Please speak clearly into your microphone",
            variant: "destructive"
          });
        } else if (event.error === 'network') {
          toast({
            title: "Network Error",
            description: "Check your internet connection",
            variant: "destructive"
          });
        }
        
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        if (isActive && isRecording) {
          // Restart recognition if still active
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
            setIsRecording(false);
          }
        }
      };
    }

    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && isSupported) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isActive]);

  const startRecording = async () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive"
      });
      return;
    }

    try {
      // Start speech recognition
      recognitionRef.current.start();
      setIsRecording(true);

      // Start audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(Math.min(100, (average / 255) * 100));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();

      toast({
        title: "Recording Started",
        description: "Speak clearly for best transcription results",
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access your microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    setCurrentTranscript('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MicOff className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Speech recognition not supported in this browser</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice to Text
          </span>
          <div className="flex items-center gap-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Level Indicator */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Audio Level</span>
              <span className="text-xs">{Math.round(audioLevel)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Transcript */}
        {currentTranscript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current transcript:</p>
            <p className="text-sm font-medium">
              {currentTranscript}
              <span className="animate-pulse ml-1">|</span>
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            onClick={toggleRecording}
            disabled={!isSupported}
            className="px-6"
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        {!isRecording && (
          <p className="text-xs text-muted-foreground text-center">
            Click start to begin voice recognition
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceToTextModule;