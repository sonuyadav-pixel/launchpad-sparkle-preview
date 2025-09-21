import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Star, Send } from 'lucide-react';

interface FeedbackFormProps {
  sessionId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const FeedbackForm = ({ sessionId, onClose, onSubmit }: FeedbackFormProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<string>('');
  const [comments, setComments] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Please provide a rating",
        description: "Rating is required to submit feedback",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Here you would typically save feedback to database
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve.",
      });

      onSubmit();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          How was your interview experience?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Overall Experience</Label>
            <RadioGroup value={rating} onValueChange={setRating}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent">Excellent - Exceeded expectations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good">Good - Met expectations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair">Fair - Somewhat helpful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor" />
                <Label htmlFor="poor">Poor - Needs improvement</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Interview Difficulty</Label>
            <RadioGroup value={difficulty} onValueChange={setDifficulty}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="challenging" id="challenging" />
                <Label htmlFor="challenging">Challenging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-hard" id="very-hard" />
                <Label htmlFor="very-hard">Very Hard</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <Label htmlFor="comments" className="text-base font-medium">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Share your thoughts about the interview experience, technical issues, or suggestions for improvement..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Skip Feedback
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;