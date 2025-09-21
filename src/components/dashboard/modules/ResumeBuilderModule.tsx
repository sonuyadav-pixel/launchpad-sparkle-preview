import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Edit, Layout } from "lucide-react";

export const ResumeBuilderModule = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create or update your professional resume with our AI-powered tools.
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6 text-primary" />
              <CardTitle>Create New Resume</CardTitle>
            </div>
            <CardDescription>
              Build a professional resume from scratch with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Start Building
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Layout className="h-6 w-6 text-primary" />
              <CardTitle>Use Template</CardTitle>
            </div>
            <CardDescription>
              Choose from professionally designed resume templates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Layout className="mr-2 h-4 w-4" />
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Builder Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-primary" />
              <span>Multiple download formats (PDF, DOCX)</span>
            </div>
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-primary" />
              <span>Professional templates</span>
            </div>
            <div className="flex items-center gap-3">
              <Edit className="h-5 w-5 text-primary" />
              <span>Real-time editing</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span>ATS-friendly formatting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};