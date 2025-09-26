import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Users, Settings, Layers, Plus, X, Sparkles } from 'lucide-react';
import { OnboardingData } from '@/pages/Onboarding';

interface SkillsStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onComplete?: () => void;
}

const SUGGESTED_SKILLS = {
  technical: [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL',
    'HTML/CSS', 'Vue.js', 'Angular', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'Machine Learning', 'Data Science', 'Cloud Computing', 'DevOps', 'Docker', 'Kubernetes'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management',
    'Critical Thinking', 'Adaptability', 'Time Management', 'Creativity', 'Negotiation',
    'Public Speaking', 'Mentoring', 'Strategic Planning', 'Conflict Resolution'
  ],
  tools: [
    'Git', 'Jira', 'Slack', 'Figma', 'Adobe Creative Suite', 'Notion', 'Confluence',
    'Salesforce', 'HubSpot', 'Tableau', 'Power BI', 'Excel', 'Google Analytics',
    'Jenkins', 'AWS', 'Azure', 'Postman', 'Sketch', 'InVision'
  ],
  frameworks: [
    'React', 'Angular', 'Vue.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'Laravel', 'Ruby on Rails', 'ASP.NET', 'TensorFlow', 'PyTorch', 'Redux',
    'Next.js', 'Nuxt.js', 'Svelte', 'Flutter', 'React Native'
  ]
};

const SkillsStep: React.FC<SkillsStepProps> = ({ 
  data, 
  updateData, 
  onNext 
}) => {
  const [newSkills, setNewSkills] = useState({
    technical: '',
    soft: '',
    tools: '',
    frameworks: ''
  });

  const [activeTab, setActiveTab] = useState('technical');

  const addSkill = (category: keyof typeof data.skills, skill: string) => {
    if (skill.trim() && !data.skills[category].includes(skill.trim())) {
      const updatedSkills = {
        ...data.skills,
        [category]: [...data.skills[category], skill.trim()]
      };
      updateData({ skills: updatedSkills });
    }
  };

  const removeSkill = (category: keyof typeof data.skills, skillToRemove: string) => {
    const updatedSkills = {
      ...data.skills,
      [category]: data.skills[category].filter(skill => skill !== skillToRemove)
    };
    updateData({ skills: updatedSkills });
  };

  const handleAddSkill = (category: keyof typeof data.skills) => {
    const skill = newSkills[category];
    if (skill.trim()) {
      addSkill(category, skill);
      setNewSkills(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: keyof typeof data.skills) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(category);
    }
  };

  const suggestSkillsWithAI = () => {
    // Placeholder for AI-powered skill suggestions based on experience and role
    const categories = Object.keys(SUGGESTED_SKILLS) as Array<keyof typeof SUGGESTED_SKILLS>;
    
    categories.forEach(category => {
      const suggestions = SUGGESTED_SKILLS[category];
      const randomSkills = suggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .filter(skill => !data.skills[category].includes(skill));
      
      const updatedSkills = {
        ...data.skills,
        [category]: [...data.skills[category], ...randomSkills]
      };
      updateData({ skills: updatedSkills });
    });
  };

  const getTotalSkillsCount = () => {
    return Object.values(data.skills).reduce((total, skills) => total + skills.length, 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Code className="h-4 w-4" />;
      case 'soft': return <Users className="h-4 w-4" />;
      case 'tools': return <Settings className="h-4 w-4" />;
      case 'frameworks': return <Layers className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const isValid = getTotalSkillsCount() > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are your key skills?</h2>
        <p className="text-muted-foreground">
          Add your skills to help AI generate relevant interview questions
        </p>
      </div>

      {/* AI Suggestion */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">Need help identifying your skills?</span>
            </div>
            <Button
              onClick={suggestSkillsWithAI}
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggest
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Our AI can suggest relevant skills based on your experience and current role
          </p>
        </CardContent>
      </Card>

      {/* Skills Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Skills & Expertise
            {getTotalSkillsCount() > 0 && (
              <Badge variant="secondary">{getTotalSkillsCount()} skills</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="soft" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Soft Skills
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Frameworks
              </TabsTrigger>
            </TabsList>

            {Object.entries(data.skills).map(([category, skills]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    Add {category.charAt(0).toUpperCase() + category.slice(1)} Skills
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`e.g., ${SUGGESTED_SKILLS[category as keyof typeof SUGGESTED_SKILLS]?.slice(0, 2).join(', ')}`}
                      value={newSkills[category as keyof typeof newSkills]}
                      onChange={(e) => setNewSkills(prev => ({ 
                        ...prev, 
                        [category]: e.target.value 
                      }))}
                      onKeyPress={(e) => handleKeyPress(e, category as keyof typeof data.skills)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddSkill(category as keyof typeof data.skills)}
                      disabled={!newSkills[category as keyof typeof newSkills].trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Skills */}
                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your {category} skills:</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          <span>{skill}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(category as keyof typeof data.skills, skill)}
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Skills */}
                {SUGGESTED_SKILLS[category as keyof typeof SUGGESTED_SKILLS] && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Suggested {category} skills:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SKILLS[category as keyof typeof SUGGESTED_SKILLS]
                        .filter(skill => !skills.includes(skill))
                        .slice(0, 8)
                        .map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => addSkill(category as keyof typeof data.skills, skill)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {skills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-12 h-12 mx-auto mb-3 opacity-50">
                      {getCategoryIcon(category)}
                    </div>
                    <p>Add your {category} skills to get started</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Skills Summary */}
      {getTotalSkillsCount() > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Skills Summary</h3>
              <div className="flex justify-center gap-4 text-sm">
                {Object.entries(data.skills).map(([category, skills]) => (
                  <div key={category} className="flex items-center gap-1">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category}: {skills.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default SkillsStep;