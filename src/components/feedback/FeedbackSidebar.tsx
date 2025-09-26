import { useState } from 'react';
import { X, TrendingUp, Lock, ArrowRight, Target, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { InterviewFeedback, ImprovementSuggestion } from '@/hooks/useInterviewFeedback';
import { FeedbackLoadingScreen } from './FeedbackLoadingScreen';

interface FeedbackSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: InterviewFeedback | null;
  suggestions: ImprovementSuggestion[];
  loading: boolean;
  onUpgrade: () => void;
}

export function FeedbackSidebar({ 
  isOpen, 
  onClose, 
  feedback, 
  suggestions, 
  loading,
  onUpgrade 
}: FeedbackSidebarProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'improvement'>('overview');

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Interview Feedback</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analysis', label: 'Analysis' },
          { id: 'improvement', label: 'Improve' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {loading ? (
          <FeedbackLoadingScreen variant="sidebar" />
        ) : !feedback ? (
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No feedback available yet.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Overall Score Card */}
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Overall Interview Score</h3>
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-primary transform -rotate-90"
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + (feedback.overall_score / 10) * 50}% 0%, ${50 + (feedback.overall_score / 10) * 50}% 100%, 50% 100%)`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{feedback.overall_score.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">/ 10</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge variant="outline" className={`${getScoreColor(feedback.overall_score)} border-current`}>
                          {getScoreLabel(feedback.overall_score)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scoreItems.filter(item => item.score !== null).map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${getScoreColor(item.score!)}`}>
                              {item.score!.toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">/ 10</span>
                          </div>
                        </div>
                        <Progress 
                          value={(item.score! / 10) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Summary */}
                {feedback.analysis_summary && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feedback.analysis_summary}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'analysis' && (
              <>
                {/* What Went Well */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      What Went Well
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.strengths?.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <Target className="h-4 w-4" />
                      What Went Wrong
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.weaknesses?.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Interview Performance Insights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          {Math.round((feedback.communication_score + feedback.clarity_score) / 2 * 10)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Communication</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          {Math.round(feedback.confidence_score * 10)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'improvement' && (
              <>
                {/* Free Suggestions */}
                {freeSuggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Quick Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {freeSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Priority {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.suggestion}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Premium Suggestions */}
                {premiumSuggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Advanced Coaching
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 opacity-75">
                        {premiumSuggestions.slice(0, 2).map((suggestion) => (
                          <div key={suggestion.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge className="text-xs">Premium</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.suggestion.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                          Unlock detailed coaching, personalized courses, and expert guidance
                        </p>
                        <Button onClick={onUpgrade} className="w-full">
                          Upgrade to Interview+
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}