import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import History from "./pages/History";
import { FeedbackDetails } from "./pages/FeedbackDetails";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider delayDuration={300} skipDelayDuration={0}>
          <ErrorBoundary>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requireOnboarding>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/:module" element={
                  <ProtectedRoute requireOnboarding>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/interview" element={
                  <ProtectedRoute requireOnboarding>
                    <Interview />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute requireOnboarding>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/feedback/:sessionId" element={
                  <ProtectedRoute requireOnboarding>
                    <FeedbackDetails />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
