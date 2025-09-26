import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Brain, Lock, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FeedbackLoadingScreen } from '@/components/feedback/FeedbackLoadingScreen';
import { useInterviewFeedback } from '@/hooks/useInterviewFeedback';

export const FeedbackDetails = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { 
    currentFeedback: feedback, 
    suggestions, 
    loading, 
    generating, 
    loadOrGenerateFeedback
  } = useInterviewFeedback();

  useEffect(() => {
    if (sessionId) {
      handleLoadFeedback();
    }
  }, [sessionId]);

  const handleLoadFeedback = async () => {
    if (!sessionId) return;
    
    // This function will check for existing feedback first, then generate if needed
    await loadOrGenerateFeedback(sessionId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const scoreItems = feedback ? [
    { label: 'Communication', score: feedback.communication_score },
    { label: 'Body Language', score: feedback.body_language_score },
    { label: 'Domain Knowledge', score: feedback.domain_knowledge_score },
    { label: 'Confidence', score: feedback.confidence_score },
    { label: 'Clarity', score: feedback.clarity_score },
  ] : [];

  const freeSuggestions = suggestions.filter(s => !s.is_premium);
  const premiumSuggestions = suggestions.filter(s => s.is_premium);

  if (loading || generating) {
    return <FeedbackLoadingScreen variant="full" />;
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Available</h3>
          <p className="text-muted-foreground mb-4">Unable to load feedback for this interview session.</p>
          <Button onClick={() => navigate('/dashboard/feedback')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feedback
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/feedback')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feedback
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Interview Feedback Analysis</h1>
              <p className="text-muted-foreground">Detailed AI-powered performance insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Overall Performance & Scores */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Overall Performance
              </h2>
            </div>

            {/* Overall Score Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-4">Interview Score</h3>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-primary transform -rotate-90"
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + (feedback.overall_score / 10) * 50}% 0%, ${50 + (feedback.overall_score / 10) * 50}% 100%, 50% 100%)`
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{feedback.overall_score.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">/ 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className={`${getScoreColor(feedback.overall_score)} border-current text-base px-4 py-2`}>
                      {getScoreLabel(feedback.overall_score)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {scoreItems.filter(item => item.score !== null).map((item) => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(item.score!)}`}>
                          {item.score!.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                    </div>
                    <Progress 
                      value={(item.score! / 10) * 100} 
                      className="h-3"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((feedback.communication_score + feedback.clarity_score) / 2 * 10)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Communication Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(feedback.confidence_score * 10)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Confidence Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: What Went Well & Wrong */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Analysis
              </h2>
            </div>

            {/* What Went Well */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What Went Wrong */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Target className="h-5 w-5" />
                  What Went Wrong
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.weaknesses?.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI Analysis Summary */}
            {feedback.analysis_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feedback.analysis_summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section 3: Improvement Suggestions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                How to Improve
              </h2>
            </div>

            {/* Free Suggestions */}
            {freeSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Improvements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {freeSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {suggestion.category}
                        </Badge>
                        <Badge variant="secondary">
                          Priority {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Premium Suggestions - Locked */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Advanced Coaching (Premium)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 opacity-60">
                  {premiumSuggestions.slice(0, 3).map((suggestion) => (
                    <div key={suggestion.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {suggestion.category}
                        </Badge>
                        <Badge className="bg-primary">Premium</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {suggestion.suggestion.substring(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Unlock Premium Coaching</h4>
                    <p className="text-sm text-muted-foreground">
                      Get detailed improvement strategies, personalized courses, and expert guidance
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      • Detailed improvement roadmap
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Personalized training courses
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • 1-on-1 expert coaching sessions
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => console.log('Navigate to Interview+ upgrade')}
                  >
                    Upgrade to Interview+
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};