import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Code, Award, Target, DollarSign, FileText, Camera,
  Edit, CheckCircle
} from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface ReviewStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext?: () => void;
  onComplete?: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  data, 
  onComplete 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getTotalSkillsCount = () => {
    return Object.values(data.skills).reduce((total, skills) => total + skills.length, 0);
  };

  const formatSalaryRange = () => {
    if (!data.salaryRange) return null;
    const { min, max, currency } = data.salaryRange;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Review your profile</h2>
        <p className="text-muted-foreground">
          Take a moment to review your information before completing setup
        </p>
      </div>

      {/* Profile Summary Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {data.profilePhoto ? (
              <img
                src={URL.createObjectURL(data.profilePhoto)}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-xl font-bold">{data.fullName}</h3>
              <p className="text-lg text-primary font-medium">{data.headline}</p>
              {data.aboutMe && (
                <p className="text-muted-foreground mt-2">{data.aboutMe}</p>
              )}
              
              {data.currentJobTitle && data.currentCompany && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>{data.currentJobTitle} at {data.currentCompany}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{data.email}</span>
            </div>
            {data.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{data.phoneNumber}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
          
          {(data.linkedinUrl || data.githubUrl || data.portfolioUrl) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Professional Links</h4>
                <div className="space-y-1">
                  {data.linkedinUrl && (
                    <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline text-sm block">
                      LinkedIn Profile
                    </a>
                  )}
                  {data.githubUrl && (
                    <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline text-sm block">
                      GitHub Profile
                    </a>
                  )}
                  {data.portfolioUrl && (
                    <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline text-sm block">
                      Portfolio Website
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      {(data.currentJobTitle || data.workExperience.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Role */}
            {data.currentJobTitle && data.currentCompany && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{data.currentJobTitle}</h4>
                  {data.isCurrentRole && <Badge>Current</Badge>}
                </div>
                <p className="text-muted-foreground">{data.currentCompany}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(data.currentRoleStartDate)} - {data.isCurrentRole ? 'Present' : formatDate(data.currentRoleEndDate || '')}
                </p>
                {data.keyResponsibilities.length > 0 && (
                  <ul className="text-sm space-y-1 ml-4">
                    {data.keyResponsibilities.slice(0, 3).map((responsibility, index) => (
                      <li key={index} className="list-disc">{responsibility}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {/* Previous Experience */}
            {data.workExperience.slice(0, 2).map((exp, index) => (
              <div key={exp.id} className="space-y-2">
                {index > 0 || data.currentJobTitle ? <Separator /> : null}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{exp.jobTitle}</h4>
                  {exp.isCurrent && <Badge>Current</Badge>}
                </div>
                <p className="text-muted-foreground">{exp.company}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                </p>
              </div>
            ))}
            
            {data.workExperience.length > 2 && (
              <p className="text-sm text-muted-foreground">
                + {data.workExperience.length - 2} more experience(s)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.education.slice(0, 2).map((edu, index) => (
              <div key={edu.id} className="space-y-1">
                {index > 0 && <Separator />}
                <h4 className="font-medium">{edu.degree}</h4>
                <p className="text-muted-foreground">{edu.university}</p>
                {edu.major && <p className="text-sm text-muted-foreground">{edu.major}</p>}
                <p className="text-sm text-muted-foreground">
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </p>
              </div>
            ))}
            {data.education.length > 2 && (
              <p className="text-sm text-muted-foreground">
                + {data.education.length - 2} more education(s)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {getTotalSkillsCount() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Skills & Expertise
              <Badge variant="secondary">{getTotalSkillsCount()} skills</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.skills).map(([category, skills]) => (
              skills.length > 0 && (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium capitalize">{category} Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {skills.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{skills.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}

      {/* Career Preferences */}
      {(data.desiredRoles.length > 0 || data.preferredIndustries.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Career Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.desiredRoles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Desired Roles</h4>
                <div className="flex flex-wrap gap-1">
                  {data.desiredRoles.slice(0, 4).map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                  {data.desiredRoles.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{data.desiredRoles.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {data.preferredIndustries.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Preferred Industries</h4>
                <div className="flex flex-wrap gap-1">
                  {data.preferredIndustries.slice(0, 4).map((industry) => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                  {data.preferredIndustries.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{data.preferredIndustries.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {formatSalaryRange() && (
              <div className="space-y-2">
                <h4 className="font-medium">Salary Expectations</h4>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatSalaryRange()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Resume */}
        {data.resumeFile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Resume Uploaded</h4>
                  <p className="text-sm text-muted-foreground">{data.resumeFile.name}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-primary ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Photo */}
        {data.profilePhoto && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Profile Photo</h4>
                  <p className="text-sm text-muted-foreground">Photo uploaded</p>
                </div>
                <CheckCircle className="h-5 w-5 text-primary ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.certifications.slice(0, 3).map((cert) => (
              <div key={cert.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.organization}</p>
                </div>
              </div>
            ))}
            {data.certifications.length > 3 && (
              <p className="text-sm text-muted-foreground">
                + {data.certifications.length - 3} more certification(s)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complete Setup */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">Ready to complete setup!</h3>
          <p className="opacity-90 mb-4">
            Your profile looks great! Click below to finish and start your AI interview experience.
          </p>
          <Button 
            onClick={onComplete}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            Complete Profile Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;