import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionDisplayProps {
  question: string;
  isAISpeaking: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  isAISpeaking 
}) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Interviewer</CardTitle>
          </div>
          
          {isAISpeaking && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Speaking...
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {question ? (
          <div className="space-y-3">
            {/* Question Text */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <p className="text-foreground leading-relaxed">
                {question}
              </p>
            </div>
            
            {/* Audio Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAISpeaking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Ready for your response</span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Preparing your first question...</p>
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Animated background when AI is speaking */}
      {isAISpeaking && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse pointer-events-none" />
      )}
    </Card>
  );
};

export default QuestionDisplay;