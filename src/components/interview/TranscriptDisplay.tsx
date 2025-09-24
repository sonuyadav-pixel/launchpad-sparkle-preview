import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Loader2 } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  speaker: 'ai' | 'user';
  message: string;
  timestamp: Date;
  isFinal: boolean;
}

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  isUserSpeaking: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  transcript, 
  isUserSpeaking 
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Transcript</CardTitle>
          {isUserSpeaking && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Listening...
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4 pb-4">
          <div className="space-y-4">
            {transcript.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Transcript will appear here as the interview progresses...</p>
              </div>
            ) : (
              transcript.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`flex gap-3 ${entry.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Speaker Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.speaker === 'ai' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {entry.speaker === 'ai' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-[80%] ${
                    entry.speaker === 'user' ? 'text-right' : 'text-left'
                  }`}>
                   <div className={`inline-block p-3 rounded-lg ${
                     entry.speaker === 'ai'
                       ? 'bg-muted text-muted-foreground'
                       : entry.isFinal 
                         ? 'bg-primary text-primary-foreground'
                         : 'bg-primary/70 text-primary-foreground border-2 border-primary/50'
                   } ${!entry.isFinal ? 'animate-pulse' : ''}`}>
                     <p className="text-sm whitespace-pre-wrap break-words">
                       {entry.message}
                       {!entry.isFinal && entry.speaker === 'user' && (
                         <span className="inline-block w-1 h-4 bg-current ml-1 animate-pulse">|</span>
                       )}
                     </p>
                     {entry.isFinal && (
                       <p className="text-xs mt-1 opacity-70">
                         {formatTime(entry.timestamp)}
                       </p>
                     )}
                     {!entry.isFinal && entry.speaker === 'user' && (
                       <p className="text-xs mt-1 opacity-70">
                         Speaking... (will finalize after 10s silence)
                       </p>
                     )}
                   </div>
                    
                    {/* Speaker Label */}
                    <div className={`text-xs text-muted-foreground mt-1 ${
                      entry.speaker === 'user' ? 'text-right' : 'text-left'
                   }`}>
                     {entry.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                     {!entry.isFinal && entry.speaker === 'user' && ' (accumulating speech...)'}
                   </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Additional speaking indicator if no interim transcript yet */}
            {isUserSpeaking && !transcript.some(entry => entry.speaker === 'user' && !entry.isFinal) && (
              <div className="flex gap-3 flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 max-w-[80%] text-right">
                  <div className="inline-block p-3 rounded-lg bg-primary/50 text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Listening for speech...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TranscriptDisplay;