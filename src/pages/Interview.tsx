import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Download,
  Timer,
  Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

const Interview = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    {
      id: '1',
      speaker: 'ai',
      message: 'Hello! Welcome to your AI interview. I\'m here to help you practice and improve your interview skills. Let\'s begin with a simple question: Can you tell me about yourself?',
      timestamp: new Date()
    }
  ]);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setInterviewDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Simulate AI speaking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAiSpeaking(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndInterview = () => {
    navigate('/dashboard');
  };

  const addTranscriptMessage = (speaker: 'user' | 'ai', message: string) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString(),
      speaker,
      message,
      timestamp: new Date()
    };
    setTranscript(prev => [...prev, newMessage]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center gap-3">
          <Circle className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">AI Interview</span>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleEndInterview}
          className="hover:bg-destructive/90"
        >
          <Phone className="h-4 w-4 mr-2" />
          End Interview
        </Button>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-4 px-4 h-screen flex flex-col">
        <div className="flex-1 grid grid-rows-2 gap-4 max-w-7xl mx-auto w-full">
          {/* Top Section - Video Panels */}
          <div className="grid grid-cols-2 gap-4">
            {/* Candidate Video Panel */}
            <Card className="relative overflow-hidden bg-muted">
              <div className="aspect-video w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                {isCameraOn ? (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">You</span>
                    </div>
                    <p className="text-muted-foreground">Camera feed would appear here</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Camera is off</p>
                  </div>
                )}
                
                {/* Timer */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">{formatTime(interviewDuration)}</span>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant={isMuted ? "destructive" : "secondary"}
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant={isCameraOn ? "secondary" : "destructive"}
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Connection Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Connected</span>
                </div>
              </div>
            </Card>

            {/* AI Bot Video Panel */}
            <Card className="relative overflow-hidden bg-muted">
              <div className="aspect-video w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center">
                  <div className={cn(
                    "w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 transition-all duration-500",
                    isAiSpeaking ? "ring-4 ring-primary/30 scale-105" : "scale-100"
                  )}>
                    <span className="text-3xl font-bold text-white">AI</span>
                  </div>
                  <p className="text-muted-foreground mb-2">AI Interviewer</p>
                  {isAiSpeaking && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Section - Transcript & Tabs */}
          <Card className="flex flex-col">
            <Tabs defaultValue="transcript" className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <TabsList className="grid w-auto grid-cols-3">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <TabsContent value="transcript" className="flex-1 px-6 pb-6">
                <ScrollArea className="h-full" ref={transcriptRef}>
                  <div className="space-y-4 pr-4">
                    {transcript.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.speaker === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-4 py-2",
                            message.speaker === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-70">
                              {message.speaker === 'user' ? 'You' : 'AI Interviewer'}
                            </span>
                            <span className="text-xs opacity-50">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary" className="flex-1 px-6 pb-6">
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Circle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Interview Summary</h3>
                    <p className="text-muted-foreground">
                      Key points and insights will appear here after the interview is completed.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="coming-soon" className="flex-1 px-6 pb-6">
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Circle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-muted-foreground">
                      New features like real-time analytics and detailed feedback are coming soon. Stay tuned!
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Interview;