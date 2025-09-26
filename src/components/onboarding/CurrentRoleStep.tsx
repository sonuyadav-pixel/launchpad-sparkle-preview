import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Plus, X } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface CurrentRoleStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const CurrentRoleStep: React.FC<CurrentRoleStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [newResponsibility, setNewResponsibility] = useState('');

  const handleInputChange = (field: keyof OnboardingData, value: string | boolean) => {
    updateData({ [field]: value });
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const updatedResponsibilities = [...data.keyResponsibilities, newResponsibility.trim()];
      updateData({ keyResponsibilities: updatedResponsibilities });
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    const updatedResponsibilities = data.keyResponsibilities.filter((_, i) => i !== index);
    updateData({ keyResponsibilities: updatedResponsibilities });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addResponsibility();
    }
  };

  const isValid = data.currentJobTitle.trim() && data.currentCompany.trim();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your current role?</h2>
        <p className="text-muted-foreground">
          Tell us about your current position and responsibilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Current Position Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentJobTitle">Job Title *</Label>
              <Input
                id="currentJobTitle"
                placeholder="e.g., Senior Product Manager"
                value={data.currentJobTitle}
                onChange={(e) => handleInputChange('currentJobTitle', e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentCompany">Company Name *</Label>
              <Input
                id="currentCompany"
                placeholder="e.g., Tech Corp Inc."
                value={data.currentCompany}
                onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                value={data.employmentType} 
                onValueChange={(value) => handleInputChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentRoleStartDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="currentRoleStartDate"
                type="month"
                value={data.currentRoleStartDate}
                onChange={(e) => handleInputChange('currentRoleStartDate', e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isCurrentRole"
              checked={data.isCurrentRole}
              onCheckedChange={(checked) => handleInputChange('isCurrentRole', checked)}
            />
            <Label htmlFor="isCurrentRole">I currently work here</Label>
          </div>

          {!data.isCurrentRole && (
            <div className="space-y-2">
              <Label htmlFor="currentRoleEndDate">End Date</Label>
              <Input
                id="currentRoleEndDate"
                type="month"
                value={data.currentRoleEndDate || ''}
                onChange={(e) => handleInputChange('currentRoleEndDate', e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default CurrentRoleStep;