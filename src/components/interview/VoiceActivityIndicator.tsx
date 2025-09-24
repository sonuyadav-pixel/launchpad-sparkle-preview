import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Bot, Loader2, Volume2 } from 'lucide-react';

interface VoiceActivityIndicatorProps {
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  energyLevel?: number;
}

const VoiceActivityIndicator: React.FC<VoiceActivityIndicatorProps> = ({ 
  isUserSpeaking, 
  isAISpeaking,
  energyLevel = 0
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
        
        {/* Voice Activity Visualizer */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const isActive = isUserSpeaking && energyLevel * 10 > index;
            return (
              <div
                key={index}
                className={`w-1 h-4 rounded-full transition-all duration-150 ${
                  isActive 
                    ? 'bg-primary scale-y-125' 
                    : 'bg-muted-foreground/30'
                }`}
                style={{
                  height: isActive 
                    ? `${Math.max(16, Math.min(32, 16 + energyLevel * 50))}px`
                    : '16px'
                }}
              />
            );
          })}
        </div>
        
        {/* Overlap Detection Warning */}
        {isUserSpeaking && isAISpeaking && (
          <Badge variant="destructive" className="animate-pulse">
            Overlap Detected
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default VoiceActivityIndicator;