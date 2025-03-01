
import { CalorieTracker } from "@/components/CalorieTracker";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      <div className="max-w-4xl mx-auto mb-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center h-12 px-6 mb-4 font-medium bg-primary/10 text-primary rounded-full">
          <span>Your Personal AI Nutritionist</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Calorie Guardian</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Track your nutrition, get AI-powered insights, and stay on top of your health goals with intelligent calorie tracking.
        </p>
      </div>
      
      <CalorieTracker />
      
      <footer className="mt-16 text-center text-sm text-muted-foreground animate-fade-in">
        <p>Powered by AI • Made with ♥ by Lovable</p>
      </footer>
    </div>
  );
};

export default Index;
