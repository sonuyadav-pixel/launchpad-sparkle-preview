import heroWoman from "@/assets/hero-woman.webp";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="relative inline-block">
            <img
              src={heroWoman}
              alt="Professional woman"
              className="w-80 h-96 object-cover rounded-2xl shadow-2xl mx-auto"
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-bold text-primary">
              Coming Soon
            </h1>
            <p className="text-xl text-muted-foreground">
              Interview4You.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
