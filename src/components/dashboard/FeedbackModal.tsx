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
import { Slider } from '@/components/ui/slider';
import { X, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Emoji mapping based on rating percentage
const getEmoji = (rating: number) => {
  if (rating >= 90) return '😄'; // Smiling
  if (rating >= 80) return '😊'; // Happy
  if (rating >= 40) return '😐'; // Flat mouth
  if (rating >= 20) return '☹️'; // Sad
  return '😢'; // Crying
};

const getRatingText = (rating: number) => {
  if (rating >= 90) return 'Excellent';
  if (rating >= 80) return 'Very Good';
  if (rating >= 60) return 'Good';
  if (rating >= 40) return 'Average';
  if (rating >= 20) return 'Poor';
  return 'Very Poor';
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [aiResponseRating, setAiResponseRating] = useState<number[]>([50]);
  const [platformRating, setPlatformRating] = useState<number[]>([50]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Here you would typically save the feedback to your database
      console.log('Feedback submitted:', { 
        aiResponseRating: aiResponseRating[0], 
        platformRating: platformRating[0],
        feedback 
      });
      
      // Show success popup instead of toast
      setShowSuccessPopup(true);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // For errors, we'll keep a simple alert for now
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    // Reset form and close modal
    setAiResponseRating([50]);
    setPlatformRating([50]);
    setFeedback('');
    onClose();
  };

  const handleClose = () => {
    setAiResponseRating([50]);
    setPlatformRating([50]);
    setFeedback('');
    onClose();
  };

  return (
    <>
      {/* Main Feedback Modal */}
      <Dialog open={isOpen && !showSuccessPopup} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-[550px] max-h-[95vh] overflow-y-auto mx-4">
          <DialogHeader className="relative">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-center pr-8">
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

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
            {/* AI Response Rating */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-medium">
                How would you rate the AI's responses?
              </Label>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl animate-scale-in">
                    {getEmoji(aiResponseRating[0])}
                  </div>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={aiResponseRating}
                    onValueChange={setAiResponseRating}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground gap-2">
                    <span>Poor</span>
                    <span className="font-medium text-primary text-center flex-1">
                      {getRatingText(aiResponseRating[0])} ({aiResponseRating[0]}%)
                    </span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Rating */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-medium">
                How would you rate the platform experience?
              </Label>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl animate-scale-in">
                    {getEmoji(platformRating[0])}
                  </div>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={platformRating}
                    onValueChange={setPlatformRating}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground gap-2">
                    <span>Poor</span>
                    <span className="font-medium text-primary text-center flex-1">
                      {getRatingText(platformRating[0])} ({platformRating[0]}%)
                    </span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Text */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="feedback" className="text-sm sm:text-base font-medium">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Tell us about your interview experience. What went well? What could be improved?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] resize-none text-sm"
                maxLength={1000}
              />
              <p className="text-xs sm:text-sm text-muted-foreground text-right">
                {feedback.length}/1000
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Skip
              </Button>
              <Button
                type="submit"
                className="flex-1 hover-scale order-1 sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={handleSuccessClose}>
        <DialogContent className="w-[95vw] max-w-[400px] text-center mx-4">
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-2 sm:p-3">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-green-700">
                Thank You!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your feedback helps us improve the interview experience.
              </p>
            </div>
            
            <Button 
              onClick={handleSuccessClose}
              className="w-full hover-scale"
            >
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};