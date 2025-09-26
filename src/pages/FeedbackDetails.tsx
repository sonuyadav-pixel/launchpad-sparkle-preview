import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Brain, Lock, ArrowRight, Star, Zap, Crown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FeedbackLoadingScreen } from '@/components/feedback/FeedbackLoadingScreen';
import { useInterviewFeedback } from '@/hooks/useInterviewFeedback';
import heroAIInterview from '@/assets/hero-ai-interview.jpg';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/feedback')}
              className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feedback
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">Interview Feedback Analysis</h1>
              <p className="text-muted-foreground animate-fade-in" style={{animationDelay: '0.1s'}}>Detailed AI-powered performance insights</p>
            </div>
            <Badge variant="secondary" className="animate-scale-in">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Overall Performance & Scores */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Overall Performance</h2>
            </div>

            {/* Overall Score Card */}
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scale-in">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-6">Interview Score</h3>
                    <div className="relative w-40 h-40 mx-auto group">
                      <div className="absolute inset-0 rounded-full border-8 border-muted/30"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-8 border-transparent transition-all duration-1000 ease-out"
                        style={{
                          background: `conic-gradient(from -90deg, hsl(var(--primary)) ${(feedback.overall_score / 10) * 360}deg, transparent ${(feedback.overall_score / 10) * 360}deg)`,
                          borderRadius: '50%',
                          mask: 'radial-gradient(circle, transparent 60px, black 80px)',
                          WebkitMask: 'radial-gradient(circle, transparent 60px, black 80px)'
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center group-hover:scale-110 transition-transform">
                          <div className="text-4xl font-bold text-primary animate-pulse">{feedback.overall_score.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">/ 10</div>
                        </div>
                      </div>
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className={`${getScoreColor(feedback.overall_score)} border-current text-base px-6 py-2 hover:scale-105 transition-transform`}>
                      {getScoreLabel(feedback.overall_score)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Detailed Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {scoreItems.filter(item => item.score !== null).map((item, index) => (
                  <div key={item.label} className="space-y-3 group hover:bg-muted/30 p-3 rounded-lg transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium group-hover:text-primary transition-colors">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold transition-all duration-300 ${getScoreColor(item.score!)}`}>
                          {item.score!.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">/ 10</span>
                      </div>
                    </div>
                    <Progress 
                      value={(item.score! / 10) * 100} 
                      className="h-3 hover:scale-[1.02] transition-transform"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg hover:scale-105 transition-transform group cursor-pointer">
                    <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                      {Math.round((feedback.communication_score + feedback.clarity_score) / 2 * 10)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-2">Communication Score</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg hover:scale-105 transition-transform group cursor-pointer">
                    <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                      {Math.round(feedback.confidence_score * 10)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-2">Confidence Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: What Went Well & Wrong */}
          <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Performance Analysis</h2>
            </div>

            {/* What Went Well */}
            <Card className="border-green-200 hover:shadow-lg transition-all duration-300 hover:border-green-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 group hover:bg-green-50/50 p-3 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                      <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What Went Wrong */}
            <Card className="border-amber-200 hover:shadow-lg transition-all duration-300 hover:border-amber-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.weaknesses?.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 group hover:bg-amber-50/50 p-3 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mt-1 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                      <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* AI Analysis Summary */}
            {feedback.analysis_summary && (
              <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 animate-fade-in" style={{animationDelay: '0.4s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Brain className="h-5 w-5" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50/50 p-4 rounded-lg">
                    <p className="text-muted-foreground leading-relaxed">
                      {feedback.analysis_summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section 3: Improvement Suggestions */}
          <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">How to Improve</h2>
            </div>

            {/* Free Suggestions */}
            {freeSuggestions.length > 0 && (
              <Card className="hover:shadow-lg transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {freeSuggestions.map((suggestion, index) => (
                    <div key={suggestion.id} className="space-y-3 p-4 border border-muted rounded-lg hover:border-primary/50 transition-colors group">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="group-hover:bg-primary/10 transition-colors">
                          {suggestion.category}
                        </Badge>
                        <Badge variant="secondary">
                          Priority {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                        {suggestion.suggestion}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Interview Plus Upsell - Premium Section with Background */}
            <div 
              className="relative overflow-hidden rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url(${heroAIInterview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
              onClick={() => navigate('/dashboard/interview-plus')}
            >
              {/* Animated Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Lock Icon Corner */}
              <div className="absolute top-4 right-4 p-3 bg-primary/20 backdrop-blur-sm rounded-full">
                <Crown className="h-6 w-6 text-primary animate-pulse" />
              </div>

              <div className="relative p-8 space-y-6 text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/30 backdrop-blur-sm rounded-lg">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Interview Plus</h3>
                      <p className="text-white/80">Unlock advanced insights to boost your score</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-center">🔒 Unlock Interview Plus to increase your score</h4>
                    
                    {/* Preview of locked features */}
                    <div className="space-y-3 opacity-70">
                      {premiumSuggestions.slice(0, 2).map((suggestion, index) => (
                        <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <Lock className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/30 text-white border-primary/50">
                                {suggestion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/90">
                              {suggestion.suggestion.substring(0, 100)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Personalized coaching</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Advanced AI analysis</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <Star className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Score improvement plan</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Progress tracking</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    size="lg" 
                    className="w-full bg-primary/90 hover:bg-primary text-white border-primary/50 hover:scale-105 transition-all duration-300 group-hover:shadow-xl"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to Interview Plus
                    <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};