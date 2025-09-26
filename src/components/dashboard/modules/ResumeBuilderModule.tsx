import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Sparkles, ArrowRight, Clock, Star, ArrowLeft } from "lucide-react";
import { ResumeUploadArea } from "@/components/resume/ResumeUploadArea";
import { ResumeTemplate } from "@/components/resume/ResumeTemplate";
import { ParsedResumeData } from "@/hooks/useResumeUpload";

export const ResumeBuilderModule = () => {
  const [view, setView] = useState<'home' | 'upload' | 'build' | 'template'>('home');
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null);

  const handleUploadComplete = (data: ParsedResumeData) => {
    setParsedResume(data);
    setView('template');
  };

  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setView('home')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Upload Your Resume</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <ResumeUploadArea onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </div>
    );
  }

  if (view === 'template' && parsedResume) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setView('home')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">Your Parsed Resume</h1>
            </div>
            <Button onClick={() => setView('upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Another
            </Button>
          </div>

          <ResumeTemplate parsedData={parsedResume} />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FileText className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            Resume Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create a professional resume that stands out. Choose your path to career success.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Upload Resume Option */}
          <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in animation-delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                      Upload Resume
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">2 minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">Quick</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Upload className="h-16 w-16 text-primary opacity-50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Already have a resume? Upload it and let our AI enhance and optimize it for better results.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  AI-powered content optimization
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  ATS compatibility check
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Professional formatting
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full group-hover:bg-primary group-hover:shadow-lg transition-all duration-300"
                onClick={() => setView('upload')}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload & Enhance
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Build From Scratch Option */}
          <Card className="group relative overflow-hidden border-2 border-transparent hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/20 animate-fade-in animation-delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors duration-300">
                    <FileText className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-secondary transition-colors duration-300">
                      Build From Scratch
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">10 minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">Popular</span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-secondary opacity-50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Create a compelling resume from the ground up with AI guidance and professional templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  Step-by-step guided process
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  AI content suggestions
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  Multiple design templates
                </li>
              </ul>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setView('build')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 text-center animate-fade-in animation-delay-700">
          <h3 className="text-2xl font-semibold mb-8 text-foreground">
            Trusted by professionals worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Resumes created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Success rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI assistance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">ATS</div>
              <div className="text-sm text-muted-foreground">Optimized</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};