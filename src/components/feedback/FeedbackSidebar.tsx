import { useState } from 'react';
import { X, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { InterviewFeedback, ImprovementSuggestion } from '@/hooks/useInterviewFeedback';

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
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !feedback ? (
          <div className="text-center text-muted-foreground py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback available for this session.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <>
                {/* Overall Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Overall Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold">{feedback.overall_score.toFixed(1)}</span>
                      <Badge variant="secondary">{getScoreLabel(feedback.overall_score)}</Badge>
                    </div>
                    <Progress value={feedback.overall_score * 10} className="mb-2" />
                    <p className="text-xs text-muted-foreground">Out of 10</p>
                  </CardContent>
                </Card>

                {/* Individual Scores */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Detailed Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scoreItems.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className={getScoreColor(item.score)}>
                            {item.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={item.score * 10} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'analysis' && (
              <>
                {/* Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feedback.analysis_summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-red-600">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
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