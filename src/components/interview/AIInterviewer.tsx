import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Bot, 
  User,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
  audioUrl?: string;
}

interface AIInterviewerProps {
  sessionId: string;
  onTranscriptUpdate?: (messages: Message[]) => void;
  onInterviewComplete?: () => void;
}

export const AIInterviewer: React.FC<AIInterviewerProps> = ({
  sessionId,
  onTranscriptUpdate,
  onInterviewComplete
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Notify parent component of transcript updates
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(messages);
    }
  }, [messages, onTranscriptUpdate]);

  // Initialize interview with welcome message
  useEffect(() => {
    const initializeInterview = async () => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        speaker: 'ai',
        message: "Welcome to your AI interview! I'm here to help you practice and improve your interview skills. Let's start with a simple question: Could you please introduce yourself and tell me about your background?",
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      
      // Generate speech for welcome message
      if (isAudioEnabled) {
        await generateAndPlaySpeech(welcomeMessage.message, welcomeMessage.id);
      }
    };

    initializeInterview();
  }, [sessionId, isAudioEnabled]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-chat', {
        body: {
          message: userMessage,
          context: messages.slice(-5), // Send last 5 messages for context
          userId: sessionId
        }
      });

      if (error) {
        console.error('AI response error:', error);
        return "I appreciate your response. Could you tell me more about that experience?";
      }

      return data.response || "Thank you for sharing. What else would you like to discuss?";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "That's interesting. Could you elaborate on that point?";
    }
  };

  const generateAndPlaySpeech = async (text: string, messageId: string): Promise<void> => {
    if (!isAudioEnabled) return;

    try {
      setIsSpeaking(true);
      setCurrentPlayingId(messageId);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text,
          voice: 'alloy' // Professional interviewer voice
        }
      });

      if (error) {
        console.error('Text-to-speech error:', error);
        toast({
          title: "Audio Error",
          description: "Could not generate speech audio",
          variant: "destructive"
        });
        return;
      }

      // Play the audio
      if (data.audioContent && audioRef.current) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setCurrentPlayingId(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing speech:', error);
      setIsSpeaking(false);
      setCurrentPlayingId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      speaker: 'user',
      message: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      // Add user message to database transcript
      await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker: 'user',
          message: userMessage.message,
          metadata: {}
        }
      });

      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage.message);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        speaker: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Add AI response to database transcript
      await supabase.functions.invoke('interview-session', {
        body: {
          action: 'add-transcript',
          session_id: sessionId,
          speaker: 'ai',
          message: aiMessage.message,
          metadata: {}
        }
      });

      // Generate and play speech for AI response
      if (isAudioEnabled) {
        await generateAndPlaySpeech(aiMessage.message, aiMessage.id);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
      setCurrentPlayingId(null);
    }
  };

  const replayMessage = async (message: Message) => {
    if (message.speaker === 'ai' && isAudioEnabled) {
      await generateAndPlaySpeech(message.message, message.id);
    }
  };

  const restartInterview = () => {
    setMessages([]);
    setCurrentInput('');
    setIsProcessing(false);
    setIsSpeaking(false);
    setCurrentPlayingId(null);
    
    // Re-initialize with welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      speaker: 'ai',
      message: "Let's start fresh! Could you please introduce yourself and tell me about your background?",
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    
    if (isAudioEnabled) {
      generateAndPlaySpeech(welcomeMessage.message, welcomeMessage.id);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-semibold">AI Interviewer</h2>
            <p className="text-sm text-muted-foreground">
              {messages.length > 1 ? `${Math.floor((messages.length - 1) / 2)} questions asked` : 'Ready to start'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="gap-2"
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {isAudioEnabled ? 'Audio On' : 'Audio Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={restartInterview}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${message.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.speaker === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {message.speaker === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <Card className={`${message.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    
                    {message.speaker === 'ai' && isAudioEnabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => replayMessage(message)}
                        disabled={currentPlayingId === message.id}
                        className="flex-shrink-0 h-6 w-6 p-0"
                      >
                        {currentPlayingId === message.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {message.speaker === 'user' ? 'You' : 'Interviewer'}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-3 justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Interviewer is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-2">
              <Volume2 className="h-3 w-3" />
              Interviewer is speaking...
            </Badge>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isProcessing || isSpeaking}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isProcessing || isSpeaking}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • The AI will respond with voice and text
        </p>
      </div>
    </div>
  );
};