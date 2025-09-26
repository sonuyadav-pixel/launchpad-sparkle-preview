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
}

const POPULAR_ROLES = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
  'DevOps Engineer', 'Business Analyst', 'Marketing Manager', 'Sales Manager',
  'Project Manager', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer'
];


const EMPLOYMENT_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid', 'Internship'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];

const CareerPreferencesStep: React.FC<CareerPreferencesStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [showSalaryFields, setShowSalaryFields] = useState(!!data.salaryRange);

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
      if (field === 'preferredLocations') setNewLocation('');
    }
  };

  const updateSalaryRange = (field: 'min' | 'max' | 'currency', value: string | number) => {
    const currentRange = data.salaryRange || { min: 0, max: 0, currency: 'USD' };
    updateData({ 
      salaryRange: { 
        ...currentRange, 
        [field]: field === 'currency' ? value : Number(value) 
      } 
    });
  };

  const toggleEmploymentType = (type: string) => {
    const currentTypes = data.preferredEmploymentType || [];
    if (currentTypes.includes(type)) {
      updateData({ 
        preferredEmploymentType: currentTypes.filter(t => t !== type) 
      });
    } else {
      updateData({ 
        preferredEmploymentType: [...currentTypes, type] 
      });
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

          {/* Current Desired Roles */}
          {data.desiredRoles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected roles:</Label>
              <div className="flex flex-wrap gap-2">
                {data.desiredRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{role}</span>
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


      {/* Employment Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred employment types:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EMPLOYMENT_TYPES.map((type) => (
                <div
                  key={type}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    data.preferredEmploymentType.includes(type)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => toggleEmploymentType(type)}
                >
                  <div className="text-center text-sm font-medium">{type}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Expectations
            <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showSalaryFields}
              onCheckedChange={setShowSalaryFields}
            />
            <Label>I want to specify salary expectations</Label>
          </div>

          {showSalaryFields && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Minimum Salary</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={data.salaryRange?.min || ''}
                  onChange={(e) => updateSalaryRange('min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Salary</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={data.salaryRange?.max || ''}
                  onChange={(e) => updateSalaryRange('max', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={data.salaryRange?.currency || 'USD'} 
                  onValueChange={(value) => updateSalaryRange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferred Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Where would you like to work?</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., San Francisco, Remote, New York"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'preferredLocations', newLocation)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => {
                  addItem('preferredLocations', newLocation);
                  setNewLocation('');
                }}
                disabled={!newLocation.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {data.preferredLocations.length > 0 && (
            <div className="space-y-2">
              <Label>Selected locations:</Label>
              <div className="flex flex-wrap gap-2">
                {data.preferredLocations.map((location) => (
                  <Badge
                    key={location}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span>{location}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem('preferredLocations', location)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default CareerPreferencesStep;