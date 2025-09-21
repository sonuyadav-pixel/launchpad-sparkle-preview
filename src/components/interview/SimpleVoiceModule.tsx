import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';

interface SimpleVoiceModuleProps {
  onTranscriptUpdate: (transcript: string, isFinal: boolean, confidence?: number) => void;
  isActive: boolean;
}

const SimpleVoiceModule: React.FC<SimpleVoiceModuleProps> = ({
  onTranscriptUpdate,
  isActive
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice to Text (Simplified)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Voice to text module is {isActive ? 'active' : 'inactive'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Full speech recognition coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleVoiceModule;