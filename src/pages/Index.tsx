import heroWoman from "@/assets/hero-woman.webp";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroWoman}
        alt="Professional woman"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl lg:text-8xl font-bold text-white drop-shadow-2xl">
            coming soon...
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-lg">
            Interview4u
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
