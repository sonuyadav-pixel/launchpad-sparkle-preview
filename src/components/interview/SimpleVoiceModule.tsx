import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square } from 'lucide-react';

interface SimpleVoiceModuleProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean, confidence?: number) => void;
  isActive: boolean;
}

const SimpleVoiceModule: React.FC<SimpleVoiceModuleProps> = ({
  onTranscriptUpdate,
  isActive
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

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
      recognitionRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly for best transcription results",
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed", 
        description: "Could not start speech recognition",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <MicOff className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Speech recognition not supported in this browser</p>
            <p className="text-xs mt-1">Try using Chrome or Edge for best results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice to Text (Browser)
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

        {/* Status */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? (isRecording ? 'Listening for speech...' : 'Ready to listen') 
              : 'Voice recognition inactive'
            }
          </p>
          
          {!isActive && (
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={toggleRecording}
              className="mt-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Manual Recording
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Using browser speech recognition</p>
          <p>• OpenAI Whisper quota exceeded, using fallback</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleVoiceModule;