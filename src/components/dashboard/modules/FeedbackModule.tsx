import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  MessageSquare, 
  Clock, 
  Calendar, 
  User, 
  TrendingUp, 
  BarChart3, 
  Filter,
  X,
  RefreshCw,
  Award,
  Target,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useInterviewFeedback } from '@/hooks/useInterviewFeedback';
import { FeedbackSidebar } from '@/components/feedback/FeedbackSidebar';
import { format } from 'date-fns';
import { InterviewLoadingScreen } from '@/components/ui/InterviewLoadingScreen';

interface InterviewSession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  interview_type: string;
}

export const FeedbackModule = () => {
  const { profile } = useUserProfile();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSidebarOpen, setFeedbackSidebarOpen] = useState(false);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    type: 'all'
  });
  
  const { 
    currentFeedback, 
    suggestions, 
    loading: feedbackLoading, 
    generating,
    loadOrGenerateFeedback,
    clearCurrentFeedback 
  } = useInterviewFeedback();

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('status', 'completed') // Only completed interviews can have feedback
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interview history:', error);
        return;
      }

      setSessions(data || []);

      // Fetch feedback data for statistics
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('interview_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (!feedbackError) {
        setFeedbackData(feedbacks || []);
      }
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowFeedback = async (sessionId: string) => {
    setSelectedSessionForFeedback(sessionId);
    
    // Check if feedback exists, if not generate it, then navigate
    await loadOrGenerateFeedback(sessionId);
    
    // Navigate to full-screen feedback page
    window.location.href = `/feedback/${sessionId}`;
    
    setSelectedSessionForFeedback(null);
  };

  const hasFeedback = (sessionId: string) => {
    return feedbackData.some(feedback => feedback.session_id === sessionId);
  };

  const handleCloseFeedback = () => {
    setFeedbackSidebarOpen(false);
    setSelectedSessionForFeedback(null);
    clearCurrentFeedback();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter sessions based on current filters
  const filteredSessions = sessions.filter(session => {
    // Status filter
    if (filters.status !== 'all' && session.status !== filters.status) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const sessionDate = new Date(session.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }

    // Type filter
    if (filters.type !== 'all' && session.interview_type !== filters.type) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const avgScore = feedbackData.length > 0 
    ? (feedbackData.reduce((sum, f) => sum + (f.overall_score || 0), 0) / feedbackData.length).toFixed(1)
    : '-';
  
  const bestScore = feedbackData.length > 0 
    ? Math.max(...feedbackData.map(f => f.overall_score || 0)).toFixed(1)
    : '-';

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      type: 'all'
    });
  };

  if (loading) {
    return <InterviewLoadingScreen />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Feedback</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze your interview performance with AI-powered insights.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{filteredSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredSessions.reduce((total, session) => total + (session.duration_seconds || 0), 0) / 60)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{bestScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.type} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Interview Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
            </SelectContent>
          </Select>

          {(filters.dateRange !== 'all' || filters.type !== 'all') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchInterviewHistory}
            className="flex items-center gap-1 ml-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredSessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Completed Interviews</h3>
            <p className="text-muted-foreground mb-4">
              Complete some interviews to see your AI-powered feedback and insights here.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Start Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {session.title}
                  </CardTitle>
                  <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{profile?.first_name || 'You'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(session.created_at), 'MMM dd, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(session.duration_seconds)}</span>
                </div>
                
                <div className="pt-2">
                  <Badge variant="outline" className="text-xs mb-3">
                    {session.interview_type}
                  </Badge>
                </div>

                <Button 
                  onClick={() => handleShowFeedback(session.id)}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  size="sm"
                  disabled={generating && selectedSessionForFeedback === session.id}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {generating && selectedSessionForFeedback === session.id 
                    ? 'Generating...' 
                    : hasFeedback(session.id) 
                      ? 'View Feedback' 
                      : 'Generate Feedback'
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Sidebar */}
      <FeedbackSidebar
        isOpen={feedbackSidebarOpen}
        onClose={handleCloseFeedback}
        feedback={currentFeedback}
        suggestions={suggestions}
        loading={feedbackLoading}
        onUpgrade={() => console.log('Navigate to Interview+ upgrade')}
      />
    </div>
  );
};