import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, Plus, X, Upload, Building } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface CertificationsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  dateEarned: string;
  certificateUrl?: string;
}

const CertificationsStep: React.FC<CertificationsStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCertification, setNewCertification] = useState<Omit<Certification, 'id'>>({
    name: '',
    organization: '',
    dateEarned: '',
    certificateUrl: ''
  });

  const addCertification = () => {
    if (newCertification.name.trim() && newCertification.organization.trim()) {
      const certification: Certification = {
        ...newCertification,
        id: Date.now().toString(),
      };
      
      const updatedCertifications = [...data.certifications, certification];
      updateData({ certifications: updatedCertifications });
      
      // Reset form
      setNewCertification({
        name: '',
        organization: '',
        dateEarned: '',
        certificateUrl: ''
      });
      setIsAddingNew(false);
    }
  };

  const removeCertification = (id: string) => {
    const updatedCertifications = data.certifications.filter(cert => cert.id !== id);
    updateData({ certifications: updatedCertifications });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Certifications & Awards</h2>
        <p className="text-muted-foreground">
          Showcase your professional certifications and achievements (Optional)
        </p>
      </div>

      {/* Existing Certifications */}
      {data.certifications.length > 0 && (
        <div className="space-y-4">
          {data.certifications.map((certification) => (
            <Card key={certification.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {certification.name}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Building className="h-4 w-4" />
                      <span>{certification.organization}</span>
                    </div>
                    {certification.dateEarned && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>Earned: {formatDate(certification.dateEarned)}</span>
                      </div>
                    )}
                    {certification.certificateUrl && (
                      <div className="mt-2">
                        <a 
                          href={certification.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <Upload className="h-3 w-3" />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(certification.id)}
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

      {/* Add New Certification */}
      {!isAddingNew ? (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <Button
              onClick={() => setIsAddingNew(true)}
              variant="ghost"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-8 w-8" />
              <span className="text-lg">Add Certification or Award</span>
              <span className="text-sm">Include professional certifications, licenses, or achievements</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Add Certification or Award
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Certification/Award Name *</Label>
              <Input
                placeholder="e.g., AWS Solutions Architect, PMP Certification"
                value={newCertification.name}
                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issuing Organization *</Label>
                <Input
                  placeholder="e.g., Amazon Web Services, PMI"
                  value={newCertification.organization}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, organization: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date Earned</Label>
                <Input
                  type="month"
                  value={newCertification.dateEarned}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, dateEarned: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certificate URL (Optional)</Label>
              <Input
                type="url"
                placeholder="https://verify.example.com/certificate/123"
                value={newCertification.certificateUrl}
                onChange={(e) => setNewCertification(prev => ({ ...prev, certificateUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Link to verify or view your certificate online
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={addCertification}
                disabled={!newCertification.name.trim() || !newCertification.organization.trim()}
              >
                Add Certification
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewCertification({
                    name: '',
                    organization: '',
                    dateEarned: '',
                    certificateUrl: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Certifications Suggestions */}
      {data.certifications.length === 0 && !isAddingNew && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base">Popular Professional Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Technology</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• AWS/Azure/Google Cloud</li>
                  <li>• Cisco Network Certifications</li>
                  <li>• Microsoft Office Specialist</li>
                  <li>• CompTIA Security+</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Business & Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• PMP (Project Management)</li>
                  <li>• Six Sigma Certifications</li>
                  <li>• Agile/Scrum Master</li>
                  <li>• Google Analytics Certified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default CertificationsStep;
