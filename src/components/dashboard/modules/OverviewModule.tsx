import React from 'react';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Award, 
  Target, 
  FileText,
  Edit,
  Upload,
  Copy,
  Calendar,
  BarChart3,
  Bot,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

const OverviewModule = () => {
  const onboardingProgress = useOnboardingProgress();
  const { profile } = useUserProfile();
  const { onboardingData, resumeData, loading, completedSteps } = onboardingProgress;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = completedSteps.length > 0 
    ? Math.round((completedSteps.length / 7) * 100) 
    : 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper function to get skills from resume data or onboarding data
  const getSkillsData = () => {
    if (resumeData?.skills) {
      return {
        technical: resumeData.skills.technical || [],
        soft: resumeData.skills.soft || [],
        tools: resumeData.skills.tools || [],
        frameworks: resumeData.skills.frameworks || []
      };
    }
    return onboardingData.skills;
  };

  // Helper function to get work experience from resume or onboarding
  const getWorkExperience = () => {
    if (resumeData?.workExperience && resumeData.workExperience.length > 0) {
      return resumeData.workExperience;
    }
    return onboardingData.workExperience;
  };

  // Helper function to get education from resume or onboarding
  const getEducation = () => {
    if (resumeData?.education && resumeData.education.length > 0) {
      return resumeData.education;
    }
    return onboardingData.education;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-64 w-64 border-4 border-primary/20">
                <AvatarImage 
                  src={onboardingData.profile_photo_path} 
                  alt={onboardingData.fullName || profile?.first_name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 text-white">
                  {onboardingData.fullName ? onboardingData.fullName.split(' ').map(n => n[0]).join('') : 
                   profile?.first_name ? (profile.first_name[0] + (profile.last_name?.[0] || '')) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {onboardingData.fullName || 'Complete your profile'}
                </h1>
                {(onboardingData.currentJobTitle || onboardingData.currentCompany) && (
                  <p className="text-base text-foreground font-medium text-center ml-4">
                    {onboardingData.currentJobTitle}
                    {onboardingData.currentJobTitle && onboardingData.currentCompany && ' at '}
                    {onboardingData.currentCompany}
                  </p>
                )}
                {onboardingData.headline && (
                  <p className="text-xl text-muted-foreground">{onboardingData.headline}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {onboardingData.totalYearsOfExperience && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {onboardingData.totalYearsOfExperience} experience
                    </Badge>
                  )}
                </div>
                
                {/* Contact Information */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {onboardingData.email && (
                    <a href={`mailto:${onboardingData.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-3 w-3" />
                      {onboardingData.email}
                    </a>
                  )}
                  {onboardingData.phoneNumber && (
                    <a href={`tel:${onboardingData.phoneNumber}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3 w-3" />
                      {onboardingData.phoneNumber}
                    </a>
                  )}
                  {onboardingData.linkedinUrl && (
                    <a href={onboardingData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </a>
                  )}
                  {onboardingData.githubUrl && (
                    <a href={onboardingData.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Github className="h-3 w-3" />
                      GitHub
                    </a>
                  )}
                  {onboardingData.portfolioUrl && (
                    <a href={onboardingData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Globe className="h-3 w-3" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Professional Summary */}
          {onboardingData.aboutMe && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {onboardingData.aboutMe}
                </p>
                <Button variant="outline" size="sm" className="mt-4 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Rewrite
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Role Snapshot */}
          {(onboardingData.currentJobTitle || onboardingData.currentCompany) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Current Role Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{onboardingData.currentJobTitle}</h4>
                    <p className="text-muted-foreground">{onboardingData.currentCompany}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employment Type</p>
                    <p className="font-medium">{onboardingData.employmentType}</p>
                  </div>
                </div>
                
                {onboardingData.currentRoleStartDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {onboardingData.currentRoleStartDate} - {onboardingData.isCurrentRole ? 'Present' : (onboardingData.currentRoleEndDate || 'Present')}
                    </p>
                  </div>
                )}

                {onboardingData.keyResponsibilities && onboardingData.keyResponsibilities.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key Responsibilities</p>
                    <ul className="space-y-1">
                      {onboardingData.keyResponsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-sm">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Work Experience Timeline */}
          {getWorkExperience() && getWorkExperience().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Work Experience Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-6">
                {getWorkExperience().map((exp, index) => (
                    <div key={index} className="relative pl-6 border-l-2 border-muted last:border-l-0">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">{exp.jobTitle}</h4>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="space-y-1 mt-2">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-sm text-muted-foreground">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {getEducation() && getEducation().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="space-y-4">
                {getEducation().map((edu, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold">{edu.degree} in {edu.major}</h4>
                      <p className="text-muted-foreground">{edu.university}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.startDate} - {edu.endDate}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Expertise */}
          {getSkillsData() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSkillsData().technical && getSkillsData().technical.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSkillsData().technical.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {getSkillsData().soft && getSkillsData().soft.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSkillsData().soft.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {getSkillsData().tools && getSkillsData().tools.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Tools & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSkillsData().tools.map((tool, index) => (
                        <Badge key={index} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {getSkillsData().frameworks && getSkillsData().frameworks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Frameworks</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSkillsData().frameworks.map((framework, index) => (
                        <Badge key={index} variant="secondary">{framework}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {onboardingData.certifications && onboardingData.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications & Awards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onboardingData.certifications.map((cert, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold">{cert.name}</h4>
                      <p className="text-muted-foreground text-sm">{cert.organization}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.dateEarned}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Career Preferences */}
          {(onboardingData.desiredRoles?.length > 0 || onboardingData.preferredIndustries?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Career Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboardingData.desiredRoles && onboardingData.desiredRoles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Desired Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.desiredRoles.map((role, index) => (
                        <Badge key={index} variant="secondary">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {onboardingData.preferredIndustries && onboardingData.preferredIndustries.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Preferred Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.preferredIndustries.map((industry, index) => (
                        <Badge key={index} variant="outline">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {onboardingData.preferredEmploymentType && onboardingData.preferredEmploymentType.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Employment Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.preferredEmploymentType.map((type, index) => (
                        <Badge key={index} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {onboardingData.preferredLocations && onboardingData.preferredLocations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Preferred Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.preferredLocations.map((location, index) => (
                        <Badge key={index} variant="outline">{location}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (30%) */}
        <div className="space-y-6">
          {/* Profile Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Profile Strength
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{completionPercentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedSteps.length} of 7 steps completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">Interview Track Suggestion</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on your {onboardingData.currentJobTitle || 'background'}, we recommend focusing on behavioral and technical interviews.
                  </p>
                </div>
                <Button size="sm" className="w-full">
                  Get Personalized Tips
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profile Created</span>
                  <span>{format(new Date(profile.created_at), 'MMM dd, yyyy')}</span>
                </div>
              )}
              {profile?.updated_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(profile.updated_at), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interviews Taken</span>
                <span>0</span>
              </div>
            </CardContent>
          </Card>

          {/* Resume Viewer */}
          {onboardingData.resumeFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Button size="sm" className="w-full">
                    Download Resume
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Replace Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export { OverviewModule };