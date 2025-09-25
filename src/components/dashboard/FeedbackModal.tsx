import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically save the feedback to your database
      console.log('Feedback submitted:', { rating, feedback });
      
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve the interview experience.",
      });
      
      // Reset form and close modal
      setRating('');
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating('');
    setFeedback('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-semibold text-center pr-8">
            Interview Feedback
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6 rounded-full"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              How was your interview experience?
            </Label>
            <RadioGroup value={rating} onValueChange={setRating} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="r5" />
                <Label htmlFor="r5" className="flex items-center space-x-1 cursor-pointer">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span>Excellent</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="r4" />
                <Label htmlFor="r4" className="flex items-center space-x-1 cursor-pointer">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <span>Good</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="r3" />
                <Label htmlFor="r3" className="flex items-center space-x-1 cursor-pointer">
                  <div className="flex">
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[1, 2].map((star) => (
                      <Star key={star} className="h-4 w-4 text-gray-300" />
                    ))}
                  </div>
                  <span>Average</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="r2" />
                <Label htmlFor="r2" className="flex items-center space-x-1 cursor-pointer">
                  <div className="flex">
                    {[1, 2].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[1, 2, 3].map((star) => (
                      <Star key={star} className="h-4 w-4 text-gray-300" />
                    ))}
                  </div>
                  <span>Poor</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="r1" />
                <Label htmlFor="r1" className="flex items-center space-x-1 cursor-pointer">
                  <div className="flex">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 text-gray-300" />
                    ))}
                  </div>
                  <span>Very Poor</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Feedback Text */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-base font-medium">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us about your interview experience. What went well? What could be improved?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground text-right">
              {feedback.length}/1000
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};