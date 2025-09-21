import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface FirstNameModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (firstName: string) => Promise<void>;
}

export const FirstNameModal = ({ open, onClose, onSubmit }: FirstNameModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your first name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(firstName.trim());
      setFirstName('');
      onClose();
      toast({
        title: "Success",
        description: "Your name has been updated!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What's your name?</DialogTitle>
          <DialogDescription>
            We'd like to personalize your experience. Please enter your first name.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Skip
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};