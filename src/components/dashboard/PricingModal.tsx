import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with AI interviews",
    features: [
      "5 interview sessions per month",
      "Basic AI feedback",
      "Standard question bank",
      "Text-based analysis",
      "Community support"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Advanced features for serious interview preparation",
    features: [
      "Unlimited interview sessions",
      "Video analysis & feedback",
      "Advanced performance analytics",
      "Industry-specific questions",
      "Personalized coaching tips",
      "Priority customer support",
      "Resume builder premium",
      "Job matching algorithm"
    ],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    popular: true
  }
];

export const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Your Plan</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-accent' : ''}`}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
                
                {plan.popular && (
                  <p className="text-center text-sm text-muted-foreground">
                    7-day free trial • Cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need a custom plan for your organization? <a href="#" className="text-primary hover:underline">Contact us</a></p>
        </div>
      </DialogContent>
    </Dialog>
  );
};