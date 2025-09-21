import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Send,
  Lightbulb,
  Heart,
  Zap,
  Users,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';

interface InterviewSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  duration_seconds: number;
}

const InterviewFeedbackModule = () => {
  const { toast } = useToast();
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback form state
  const [rating, setRating] = useState<number>(0);
  const [experienceType, setExperienceType] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const experienceOptions = [
    { id: 'excellent', label: 'Excellent', icon: Heart, color: 'text-green-500' },
    { id: 'good', label: 'Good', icon: ThumbsUp, color: 'text-blue-500' },
    { id: 'average', label: 'Average', icon: Target, color: 'text-yellow-500' },
    { id: 'poor', label: 'Needs Work', icon: ThumbsDown, color: 'text-red-500' }
  ];

  const improvementOptions = [
    'AI Response Quality',
    'Speech Recognition',
    'Audio Quality', 
    'Question Variety',
    'Interface Design',
    'Response Time',
    'Technical Issues',
    'Overall Experience'
  ];

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('interview-session', {
        body: {
          action: 'get-user-sessions',
          user_id: user.id
        }
      });

      if (error) throw error;

      // Get only the most recent completed session
      const completedSessions = (data.sessions || [])
        .filter((session: InterviewSession) => session.status === 'completed')
        .slice(0, 1); // Only get the last one
      
      setRecentSessions(completedSessions);
      if (completedSessions.length > 0) {
        setSelectedSession(completedSessions[0]); // Auto-select the most recent one
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
  };

  const toggleImprovement = (improvement: string) => {
    setImprovements(prev => 
      prev.includes(improvement) 
        ? prev.filter(item => item !== improvement)
        : [...prev, improvement]
    );
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSession || rating === 0) {
      toast({
        title: "Please Complete Feedback",
        description: "Please select a session and provide a rating",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Here you would submit feedback to your backend
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve your interview experience",
      });

      // Reset form
      setRating(0);
      setExperienceType('');
      setFeedback('');
      setImprovements([]);
      setWouldRecommend(null);

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Completed Interviews</h3>
            <p className="text-muted-foreground">
              Complete your first AI interview to share feedback and help us improve!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          How was your interview experience?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us create better AI interviews for everyone
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Selection - Only show if more than one session, otherwise auto-select */}
        <div>
          <h4 className="font-medium mb-3">Most Recent Interview</h4>
          <div className="grid gap-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSession?.id === session.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{session.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(session.duration_seconds)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(session.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedSession && (
          <>
            {/* Rating */}
            <div>
              <h4 className="font-medium mb-3">Overall Rating</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className="transition-colors"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Type */}
            <div>
              <h4 className="font-medium mb-3">How would you describe your experience?</h4>
              <div className="grid grid-cols-2 gap-2">
                {experienceOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setExperienceType(option.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        experienceType === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${option.color}`} />
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="font-medium mb-3">What could we improve?</h4>
              <div className="flex flex-wrap gap-2">
                {improvementOptions.map((improvement) => (
                  <button
                    key={improvement}
                    onClick={() => toggleImprovement(improvement)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      improvements.includes(improvement)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {improvement}
                  </button>
                ))}
              </div>
            </div>

            {/* Would Recommend */}
            <div>
              <h4 className="font-medium mb-3">Would you recommend this to others?</h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setWouldRecommend(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    wouldRecommend === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-border hover:border-green-500'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes, definitely!
                </button>
                <button
                  onClick={() => setWouldRecommend(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    wouldRecommend === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-border hover:border-red-500'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Not yet
                </button>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div>
              <h4 className="font-medium mb-3">Tell us more (optional)</h4>
              <Textarea
                placeholder="Share any specific feedback, suggestions, or experiences you'd like us to know about..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmitFeedback}
              disabled={submitting || rating === 0}
              className="w-full"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewFeedbackModule;