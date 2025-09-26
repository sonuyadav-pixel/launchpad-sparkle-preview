import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Brain, Lock, ArrowRight, Star, Zap, Crown, ChevronRight, ChevronDown, ChevronUp, Calendar, Clock, User, Building2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FeedbackLoadingScreen } from '@/components/feedback/FeedbackLoadingScreen';
import { useInterviewFeedback } from '@/hooks/useInterviewFeedback';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import lightLandscapeBg from '@/assets/light-landscape-bg.jpg';

export const FeedbackDetails = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [sessionData, setSessionData] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
      fetchSessionData();
    }
  }, [sessionId]);

  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (!error && data) {
        setSessionData(data);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Interview Details Section - Collapsible */}
        <Card className="border-primary/20 hover:shadow-lg transition-all duration-300 animate-fade-in">
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    Interview Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Session Info</Badge>
                    {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Candidate Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Candidate</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Unknown Candidate'}
                    </div>
                  </div>

                  {/* Role Applied */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Role Applied</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {sessionData?.role_applied || 'Software Engineer'}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">Company</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {sessionData?.company_name || 'Tech Company'}
                    </div>
                  </div>

                  {/* Interview Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Interview Date</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {sessionData?.created_at ? format(new Date(sessionData.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sessionData?.created_at ? format(new Date(sessionData.created_at), 'h:mm a') : ''}
                    </div>
                  </div>
                </div>

                {/* Additional Interview Stats */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {sessionData?.duration_seconds 
                        ? `${Math.floor(sessionData.duration_seconds / 60)}m ${sessionData.duration_seconds % 60}s`
                        : 'N/A'
                      }
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Interview Type</span>
                    </div>
                    <div className="text-lg font-bold text-primary capitalize">
                      {sessionData?.interview_type || 'General'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Status
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-primary capitalize">
                      {sessionData?.status || 'Completed'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Center: Interview Score */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-8">My Interview Score</h2>
          <Card className="max-w-md mx-auto bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scale-in">
            <CardContent className="p-8">
              <div className="text-center space-y-8">
                {/* Large Score Display */}
                <div className="space-y-4">
                  <div className={`text-[35px] font-bold animate-pulse ${
                    feedback.overall_score < 5 
                      ? 'text-red-500' 
                      : feedback.overall_score <= 8 
                      ? 'text-yellow-500' 
                      : 'text-green-500'
                  }`}>
                    {feedback.overall_score.toFixed(1)}
                  </div>
                  <div className="text-2xl text-muted-foreground font-medium">out of 10</div>
                </div>


                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Performance Score</span>
                    <span>{feedback.overall_score.toFixed(1)}/10</span>
                  </div>
                  <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out ${
                        feedback.overall_score >= 7 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : feedback.overall_score >= 4 
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600' 
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${(feedback.overall_score / 10) * 100}%` }}
                    />
                    <div className={`absolute -inset-1 rounded-full opacity-0 hover:opacity-100 transition-opacity blur-xl ${
                      feedback.overall_score >= 7 
                        ? 'bg-gradient-to-r from-green-400/20 to-green-600/20' 
                        : feedback.overall_score >= 4 
                        ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20' 
                        : 'bg-gradient-to-r from-red-400/20 to-red-600/20'
                    }`}></div>
                  </div>
                </div>

                <Badge variant="outline" className={`${getScoreColor(feedback.overall_score)} border-current text-lg px-8 py-3 hover:scale-105 transition-transform`}>
                  {getScoreLabel(feedback.overall_score)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Score Breakdown and Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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

        {/* Performance Analysis Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Performance Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What Went Well - Green Gradient with Blur and Lock */}
            <Card className="relative bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden group">
              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10"></div>
              
              {/* Lock Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="p-4 bg-white/80 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Lock className="h-8 w-8 text-green-600 group-hover:animate-pulse" />
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 group hover:bg-green-200/50 p-3 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                      <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas for Improvement - Orange/Red Gradient with Blur and Lock */}
            <Card className="relative bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden group" style={{animationDelay: '0.3s'}}>
              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-10"></div>
              
              {/* Lock Icon */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="p-4 bg-white/80 rounded-full shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Lock className="h-8 w-8 text-orange-600 group-hover:animate-pulse" />
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {feedback.weaknesses?.map((weakness: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 group hover:bg-orange-200/50 p-3 rounded-lg transition-colors">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-1 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                      <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Improve Section - Only 2 Points */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">How to Improve</h2>
          {freeSuggestions.length > 0 && (
            <Card className="max-w-4xl mx-auto hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {freeSuggestions.slice(0, 2).map((suggestion, index) => (
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
        </div>

        {/* Arrow Animation */}
        <div className="flex justify-center mb-8">
          <div className="animate-bounce">
            <ArrowDown className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Interview Plus Landscape Banner */}
        <div 
          className="relative overflow-hidden rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9)), url(${lightLandscapeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '300px'
          }}
          onClick={() => navigate('/dashboard/interview-plus')}
        >
          {/* Light overlay for better text contrast */}
          <div className="absolute inset-0 bg-white/20"></div>
          
          {/* Lock Icon */}
          <div className="absolute top-6 right-6 p-4 bg-primary/80 rounded-full">
            <Lock className="h-8 w-8 text-white animate-pulse" />
          </div>

          {/* Discount Badge */}
          <div className="absolute top-6 left-6 px-4 py-2 bg-red-500 rounded-full text-white font-bold text-lg animate-pulse">
            50% OFF
          </div>

          <div className="relative p-8 lg:p-12 grid grid-cols-1 gap-8 items-center min-h-[300px]">
            {/* Content */}
            <div className="space-y-6 text-foreground text-center">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">🔒 Unlock Interview Plus</h3>
                <p className="text-xl text-muted-foreground">Prioritize your improvement areas and boost your score</p>
              </div>

              {/* Value Propositions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-card/80 border border-border rounded-lg">
                  <Target className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Personalized improvement roadmap</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/80 border border-border rounded-lg">
                  <Brain className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Advanced AI-powered analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/80 border border-border rounded-lg">
                  <Star className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Priority-based scoring system</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/80 border border-border rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Track progress over time</span>
                </div>
              </div>

              {/* Discount Offer */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-red-600">Limited Time Offer!</div>
                  <div className="text-lg text-foreground">Get 50% off your first month</div>
                  <div className="text-sm text-muted-foreground">Upgrade now and see immediate improvements</div>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                size="lg" 
                className="w-full hover:scale-105 transition-all duration-300 text-lg py-6"
              >
                <Crown className="h-6 w-6 mr-3" />
                Unlock Interview Plus - 50% Off
                <ChevronRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};