import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroWoman from "@/assets/hero-woman.webp";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [email, setEmail] = useState("");

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks! We'll notify you when we launch.");
      setEmail("");
    } else {
      toast.error("Please enter your email address.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Interview4You</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Coming <span className="text-primary">Soon</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get ready for the ultimate interview preparation platform. Master your skills, 
                boost your confidence, and land your dream job.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg">Mock Interviews</h3>
                  <p className="text-sm text-muted-foreground mt-2">Practice with AI-powered interviews</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg">Expert Tips</h3>
                  <p className="text-sm text-muted-foreground mt-2">Learn from industry professionals</p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-lg">Career Guidance</h3>
                  <p className="text-sm text-muted-foreground mt-2">Get personalized career advice</p>
                </div>
              </div>

              <form onSubmit={handleNotifyMe} className="flex gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="whitespace-nowrap">
                  Notify Me
                </Button>
              </form>
              
              <p className="text-sm text-muted-foreground">
                Be the first to know when we launch. No spam, just updates.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroWoman}
                alt="Professional woman ready for interview success"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl transform rotate-3 -z-10"></div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border mt-16">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Interview4You. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
