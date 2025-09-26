import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Calendar, Plus, X, School } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface EducationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

interface Education {
  id: string;
  degree: string;
  university: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

const DEGREE_OPTIONS = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'MBA',
  'PhD',
  'Professional Certificate',
  'Trade School Certificate',
  'Other'
];

const EducationStep: React.FC<EducationStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [isAddingNew, setIsAddingNew] = useState(data.education.length === 0);
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    degree: '',
    university: '',
    major: '',
    startDate: '',
    endDate: '',
    gpa: ''
  });

  const addEducation = () => {
    if (newEducation.degree.trim() && newEducation.university.trim()) {
      const education: Education = {
        ...newEducation,
        id: Date.now().toString(),
      };
      
      const updatedEducation = [...data.education, education];
      updateData({ education: updatedEducation });
      
      // Reset form
      setNewEducation({
        degree: '',
        university: '',
        major: '',
        startDate: '',
        endDate: '',
        gpa: ''
      });
      setIsAddingNew(false);
    }
  };

  const removeEducation = (id: string) => {
    const updatedEducation = data.education.filter(edu => edu.id !== id);
    updateData({ education: updatedEducation });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your educational background</h2>
        <p className="text-muted-foreground">
          Share your academic qualifications and achievements
        </p>
      </div>

      {/* Existing Education */}
      {data.education.length > 0 && (
        <div className="space-y-4">
          {data.education.map((education) => (
            <Card key={education.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{education.degree}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <School className="h-4 w-4" />
                      <span>{education.university}</span>
                    </div>
                    {education.major && (
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>{education.major}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(education.startDate)} - {formatDate(education.endDate)}
                        </span>
                      </div>
                      {education.gpa && (
                        <span className="text-primary font-medium">
                          GPA: {education.gpa}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(education.id)}
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

      {/* Add New Education */}
      {!isAddingNew ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="ghost"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-8 w-8" />
              <span className="text-lg">Add Education</span>
              <span className="text-sm">Include degrees, certifications, or relevant coursework</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Add Educational Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree/Qualification *</Label>
                <Select 
                  value={newEducation.degree} 
                  onValueChange={(value) => setNewEducation(prev => ({ ...prev, degree: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREE_OPTIONS.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Institution *</Label>
                <Input
                  placeholder="e.g., Stanford University"
                  value={newEducation.university}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Major/Field of Study</Label>
              <Input
                placeholder="e.g., Computer Science, Business Administration"
                value={newEducation.major}
                onChange={(e) => setNewEducation(prev => ({ ...prev, major: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>GPA (Optional)</Label>
                <Input
                  placeholder="e.g., 3.8, 85%"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={addEducation}
                disabled={!newEducation.degree.trim() || !newEducation.university.trim()}
              >
                Add Education
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewEducation({
                    degree: '',
                    university: '',
                    major: '',
                    startDate: '',
                    endDate: '',
                    gpa: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Education Notice */}
      {data.education.length === 0 && !isAddingNew && (
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Education background helps AI understand your foundational knowledge and specializations
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} className="px-6">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default EducationStep;
