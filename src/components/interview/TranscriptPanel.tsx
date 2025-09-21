import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Bot, Mic } from 'lucide-react';

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
  confidence?: number;
}

interface TranscriptPanelProps {
  transcript: TranscriptMessage[];
  currentTranscript: string;
  isListening: boolean;
  isAISpeaking: boolean;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  currentTranscript,
  isListening,
  isAISpeaking
}) => {
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Live Transcript
          </CardTitle>
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge variant="outline" className="text-xs animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            {isAISpeaking && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                <Bot className="h-3 w-3 mr-1" />
                AI Speaking
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {/* Live/Current Transcript */}
            {currentTranscript && (
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">You (speaking...)</span>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentTranscript}
                  <span className="animate-pulse ml-1">|</span>
                </p>
              </div>
            )}

            {/* Historical Transcript Messages */}
            {transcript.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`border-l-4 pl-4 py-2 rounded-r-lg ${
                    message.speaker === 'user'
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10'
                      : 'border-green-500 bg-green-50/30 dark:bg-green-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {message.speaker === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-green-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          message.speaker === 'user' ? 'text-blue-600' : 'text-green-600'
                        }`}
                      >
                        {message.speaker === 'user' ? 'You' : 'AI Interviewer'}
                      </span>
                      {message.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(message.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
                {index < transcript.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}

            {transcript.length === 0 && !currentTranscript && (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">
                  Start speaking to see the live transcript here
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;