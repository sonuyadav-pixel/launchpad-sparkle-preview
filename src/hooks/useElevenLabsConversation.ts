import { useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { useToast } from '@/components/ui/use-toast';

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export const useElevenLabsConversation = (agentId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const { toast } = useToast();
  const messageIdCounter = useRef(0);

  const conversation = useConversation({
    onConnect: () => {
      console.log('🔗 ElevenLabs conversation connected');
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Voice conversation is ready",
      });
    },
    onDisconnect: () => {
      console.log('🔌 ElevenLabs conversation disconnected');
      setIsConnected(false);
      setConversationId(null);
    },
    onError: (error) => {
      console.error('❌ ElevenLabs conversation error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to voice conversation",
        variant: "destructive"
      });
    },
    onMessage: (message) => {
      console.log('📨 ElevenLabs message received:', message);
      
      // Add message to transcript
      const transcriptMessage: TranscriptMessage = {
        id: (++messageIdCounter.current).toString(),
        speaker: message.source === 'user' ? 'user' : 'ai',
        message: message.message,
        timestamp: new Date()
      };
      
      setTranscript(prev => [transcriptMessage, ...prev]);
    }
  });

  const startConversation = useCallback(async () => {
    try {
      console.log('🚀 Starting ElevenLabs conversation...');
      
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use provided agentId or get signed URL for private agent
      if (agentId) {
        const id = await conversation.startSession({ agentId });
        setConversationId(id);
      } else {
        // For demo purposes, we'll use a public agent ID
        // In production, you should get a signed URL from your backend
        toast({
          title: "Agent Required",
          description: "Please provide an ElevenLabs agent ID",
          variant: "destructive"
        });
        return;
      }
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
      toast({
        title: "Failed to Start",
        description: "Could not start voice conversation. Please check microphone access.",
        variant: "destructive"
      });
    }
  }, [agentId, conversation, toast]);

  const endConversation = useCallback(async () => {
    try {
      console.log('🛑 Ending ElevenLabs conversation...');
      await conversation.endSession();
      setTranscript([]);
    } catch (error) {
      console.error('❌ Failed to end conversation:', error);
    }
  }, [conversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
    }
  }, [conversation]);

  return {
    startConversation,
    endConversation,
    setVolume,
    isConnected,
    conversationId,
    transcript,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status
  };
};