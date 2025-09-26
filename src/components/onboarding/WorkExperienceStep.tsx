import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Plus, X, Edit3, MapPin } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface WorkExperienceStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  achievements: string[];
}

const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExperience, setNewExperience] = useState<Omit<WorkExperience, 'id'>>({
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    achievements: []
  });
  const [newAchievement, setNewAchievement] = useState('');

  const addExperience = () => {
    if (newExperience.jobTitle.trim() && newExperience.company.trim()) {
      const experience: WorkExperience = {
        ...newExperience,
        id: Date.now().toString(),
      };
      
      const updatedExperience = [...data.workExperience, experience];
      updateData({ workExperience: updatedExperience });
      
      // Reset form
      setNewExperience({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        achievements: []
      });
      setNewAchievement('');
      setIsAddingNew(false);
    }
  };

  const removeExperience = (id: string) => {
    const updatedExperience = data.workExperience.filter(exp => exp.id !== id);
    updateData({ workExperience: updatedExperience });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setNewExperience(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setNewExperience(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAchievement();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your work experience</h2>
      </div>

      {/* Years of Experience Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Total Years of Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="totalYearsOfExperience">How many years of professional experience do you have?</Label>
            <Select 
              value={data.totalYearsOfExperience} 
              onValueChange={(value) => updateData({ totalYearsOfExperience: value })}
            >
              <SelectTrigger className="w-full bg-background border border-input">
                <SelectValue placeholder="Select years of experience" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input shadow-lg z-50">
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-2">1-2 years</SelectItem>
                <SelectItem value="2-3">2-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-7">5-7 years</SelectItem>
                <SelectItem value="7-10">7-10 years</SelectItem>
                <SelectItem value="10-15">10-15 years</SelectItem>
                <SelectItem value="15+">15+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Existing Experiences */}
      {data.workExperience.length > 0 && (
        <div className="space-y-4">
          {data.workExperience.map((experience) => (
            <Card key={experience.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{experience.jobTitle}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{experience.company}</span>
                      {experience.location && (
                        <>
                          <span>•</span>
                          <MapPin className="h-4 w-4" />
                          <span>{experience.location}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(experience.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })} - {
                          experience.isCurrent 
                            ? 'Present' 
                            : experience.endDate 
                              ? new Date(experience.endDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })
                              : 'Present'
                        }
                      </span>
                      {experience.isCurrent && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    {experience.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Key Achievements:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {experience.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(experience.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Experience */}
      {!isAddingNew ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="ghost"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-8 w-8" />
              <span className="text-lg">Add Work Experience</span>
              <span className="text-sm">Include previous roles, internships, or projects</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Add Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g., Software Engineer"
                  value={newExperience.jobTitle}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, jobTitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  placeholder="e.g., TechCorp Inc."
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., San Francisco, CA"
                value={newExperience.location}
                onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  disabled={newExperience.isCurrent}
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newExperience.isCurrent}
                onCheckedChange={(checked) => setNewExperience(prev => ({ 
                  ...prev, 
                  isCurrent: checked,
                  endDate: checked ? '' : prev.endDate
                }))}
              />
              <Label>I currently work here</Label>
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <Label>Key Achievements</Label>
              <div className="flex gap-2">
                <Textarea
                  placeholder="e.g., Increased user engagement by 40% through redesigned onboarding flow"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[60px]"
                />
                <Button
                  type="button"
                  onClick={addAchievement}
                  disabled={!newAchievement.trim()}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {newExperience.achievements.length > 0 && (
                <div className="space-y-2 mt-3">
                  {newExperience.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 border rounded bg-muted/30">
                      <span className="flex-1 text-sm">{achievement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={addExperience}
                disabled={!newExperience.jobTitle.trim() || !newExperience.company.trim()}
              >
                Add Experience
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewExperience({
                    jobTitle: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    isCurrent: false,
                    achievements: []
                  });
                  setNewAchievement('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default WorkExperienceStep;
