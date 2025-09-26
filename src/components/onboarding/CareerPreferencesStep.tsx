import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Target, MapPin, DollarSign, Plus, X, Briefcase, Building } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface CareerPreferencesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
  showValidationErrors?: boolean;
}

const POPULAR_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
  'DevOps Engineer', 'Business Analyst', 'Marketing Manager', 'Sales Manager',
  'Project Manager', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer'
];



const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];

const CareerPreferencesStep: React.FC<CareerPreferencesStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [newRole, setNewRole] = useState('');
  

  const addItem = (field: keyof OnboardingData, value: string) => {
    const currentArray = Array.isArray(data[field]) ? data[field] as string[] : [];
    if (value.trim() && !currentArray.includes(value.trim())) {
      updateData({ [field]: [...currentArray, value.trim()] });
    }
  };

  const removeItem = (field: keyof OnboardingData, valueToRemove: string) => {
    const currentArray = Array.isArray(data[field]) ? data[field] : [];
    updateData({ [field]: currentArray.filter(item => item !== valueToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: keyof OnboardingData, value: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(field, value);
      // Reset the input based on field type
      if (field === 'desiredRoles') setNewRole('');
    }
  };



  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are you looking for?</h2>
      </div>

      {/* Desired Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desired Roles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Desired Roles - Show first */}
          {data.desiredRoles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Selected roles:</Label>
              <div className="flex flex-wrap gap-2">
                {data.desiredRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 text-sm px-3 py-1 bg-blue-900 text-white hover:bg-blue-800 border-blue-900"
                  >
                    <span className="text-sm font-medium text-white">{role}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem('desiredRoles', role)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Input - Show second */}
          <div className="space-y-2">
            <Label>What roles are you interested in?</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Senior Software Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'desiredRoles', newRole)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  addItem('desiredRoles', newRole);
                  setNewRole('');
                }}
                disabled={!newRole.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Popular Roles */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Popular roles:</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES
                .filter(role => !data.desiredRoles.includes(role))
                .slice(0, 6)
                .map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => addItem('desiredRoles', role)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default CareerPreferencesStep;