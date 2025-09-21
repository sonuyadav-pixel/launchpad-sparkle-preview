import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock, Award } from "lucide-react";

const courses = [
  {
    title: "Interview Mastery",
    description: "Learn advanced interview techniques and strategies",
    duration: "2h 30m",
    level: "Intermediate",
    progress: 65,
  },
  {
    title: "Technical Interview Prep",
    description: "Prepare for coding and technical interviews",
    duration: "4h 15m",
    level: "Advanced",
    progress: 0,
  },
  {
    title: "Behavioral Questions",
    description: "Master the art of answering behavioral questions",
    duration: "1h 45m",
    level: "Beginner",
    progress: 100,
  },
];

export const LearningModule = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning</h1>
          <p className="text-muted-foreground mt-1">
            Upskill with curated learning content and advance your career.
          </p>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <Card key={index} className="card-hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </div>
                <Badge variant={course.level === "Beginner" ? "secondary" : course.level === "Intermediate" ? "default" : "destructive"}>
                  {course.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {course.duration}
              </div>
              
              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full" 
                variant={course.progress === 100 ? "outline" : "default"}
              >
                {course.progress === 100 ? (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : course.progress > 0 ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Course
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};