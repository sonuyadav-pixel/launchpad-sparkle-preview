import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ComingSoonModuleProps {
  title: string;
  description: string;
}

export const ComingSoonModule = ({ title, description }: ComingSoonModuleProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Coming Soon Card */}
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl text-muted-foreground">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};