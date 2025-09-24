import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Bot, Loader2, Volume2 } from 'lucide-react';

interface VoiceActivityIndicatorProps {
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
}

const VoiceActivityIndicator: React.FC<VoiceActivityIndicatorProps> = ({ 
  isUserSpeaking, 
  isAISpeaking
}) => {
  const getStatusBadge = () => {
    if (isAISpeaking) {
      return (
        <Badge variant="secondary" className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <Volume2 className="w-3 h-3" />
          AI Speaking
        </Badge>
      );
    }
    
    if (isUserSpeaking) {
      return (
        <Badge variant="default" className="flex items-center gap-2">
          <Mic className="w-4 h-4" />
          <Loader2 className="w-3 h-3 animate-spin" />
          You're Speaking
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-muted-foreground" />
        Listening
      </Badge>
    );
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        {getStatusBadge()}
        
        {/* Simple Status Indicator */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isUserSpeaking ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
          }`} />
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isAISpeaking ? 'bg-secondary animate-pulse' : 'bg-muted-foreground/30'
          }`} />
        </div>
      </div>
    </Card>
  );
};

export default VoiceActivityIndicator;