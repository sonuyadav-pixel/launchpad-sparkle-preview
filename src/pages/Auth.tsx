import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Auth.tsx - Initial session check:', session?.user?.email || 'No session');
      if (session) {
        try {
          // Check if user has completed onboarding
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();
            
          console.log('Auth.tsx - Profile query result:', { profile, error });
          
          if (error) {
            console.error('Auth.tsx - Profile query error:', error);
            // If profile doesn't exist or error, redirect to onboarding
            navigate("/onboarding", { replace: true });
          } else if (profile?.onboarding_completed) {
            console.log('Auth.tsx - Redirecting to dashboard');
            navigate("/dashboard", { replace: true });
          } else {
            console.log('Auth.tsx - Redirecting to onboarding');
            navigate("/onboarding", { replace: true });
          }
        } catch (err) {
          console.error('Auth.tsx - Unexpected error:', err);
          navigate("/onboarding", { replace: true });
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth.tsx - Auth state change:', event, session?.user?.email || 'No session');
        if (session) {
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();
            
          if (profile?.onboarding_completed) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(error.message);
        }
      } else {
        setSentToEmail(email);
        setEmailSent(true);
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(error.message);
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      {/* Logo in top left */}
      <div className="fixed top-4 left-4 z-50">
        <Logo size="md" />
      </div>
      
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        
      <Card className="w-full">
        {emailSent ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-green-800 mb-2">
                  Email has been sent to:
                </p>
                <p className="font-semibold text-green-900 mb-3">
                  {sentToEmail}
                </p>
                <p className="text-xs text-green-700">
                  Please check your inbox and click the verification link to complete your registration.
                </p>
              </div>
              
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEmailSent(false);
                    setIsSignUp(false);
                    setEmail("");
                    setPassword("");
                    setError("");
                  }}
                  className="w-full"
                >
                Back to Sign In
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? "Create Your Account" : "Welcome to Interview4U"}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? "Sign up to start your AI interview journey" 
                  : "Sign in to access your AI-powered interview platform"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={isSignUp ? "Choose a strong password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={isSignUp ? 6 : undefined}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? "Creating account..." : "Signing in..."}
                      </>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground">
                  {isSignUp ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError("");
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in here
                      </button>
                    </>
                  ) : (
                    <>
                      New user?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError("");
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Register now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        )}
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;