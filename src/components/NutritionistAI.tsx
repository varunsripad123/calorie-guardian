
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile, DailyNutrition, NutritionAdvice } from "@/types";
import { generateNutritionAdvicePrompt } from "@/lib/calorieUtils";
import { Sparkles, RefreshCw, Bot } from "lucide-react";

interface NutritionistAIProps {
  userProfile: UserProfile;
  dailyNutrition: DailyNutrition;
}

export function NutritionistAI({ userProfile, dailyNutrition }: NutritionistAIProps) {
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNutritionAdvice = async () => {
    setIsLoading(true);
    try {
      // For demonstration, we're mocking the API call
      // In a real application, this would be an actual API call to Gemini
      const prompt = generateNutritionAdvicePrompt(dailyNutrition, userProfile);
      
      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response based on calorie intake compared to target
      let message = "";
      let type: NutritionAdvice["type"] = "info";
      
      const caloriePercentage = (dailyNutrition.totalCalories / userProfile.targetCalories) * 100;
      
      if (caloriePercentage > 100) {
        message = `You've exceeded your target calories for today. Consider focusing on protein-rich foods and vegetables if you get hungry again. A short walk might help too!`;
        type = "warning";
      } else if (caloriePercentage > 90) {
        message = `You're very close to your daily calorie target. You're doing great balancing your nutrients today! Keep it up.`;
        type = "success";
      } else if (caloriePercentage > 50) {
        message = `You're making good progress toward your daily goals. Try to include some more protein in your upcoming meals to help with satiety and muscle maintenance.`;
        type = "info";
      } else {
        message = `You still have plenty of calories left for the day. Focus on nutrient-dense foods like lean proteins, healthy fats, and complex carbs for your upcoming meals.`;
        type = "info";
      }
      
      setAdvice({ message, type });
    } catch (error) {
      console.error("Error fetching nutrition advice:", error);
      setAdvice({
        message: "I couldn't analyze your nutrition right now. Please try again later.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch advice when component mounts or nutrition changes significantly
  useEffect(() => {
    if (dailyNutrition.items.length > 0) {
      fetchNutritionAdvice();
    }
  }, [dailyNutrition.totalCalories]);

  const getAdviceCardClass = () => {
    if (!advice) return "border-muted";
    
    switch (advice.type) {
      case "success":
        return "border-green-400/20 bg-green-50/50 dark:bg-green-950/20";
      case "warning":
        return "border-yellow-400/20 bg-yellow-50/50 dark:bg-yellow-950/20";
      case "error":
        return "border-red-400/20 bg-red-50/50 dark:bg-red-950/20";
      case "info":
      default:
        return "border-blue-400/20 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 animate-fade-in ${getAdviceCardClass()}`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium">Nutrition Coach</h3>
            <p className="text-sm text-muted-foreground">AI-powered guidance</p>
          </div>
        </div>
        
        <div className="min-h-[80px] flex items-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <Sparkles size={16} className="animate-pulse" />
              <span>Analyzing your nutrition...</span>
            </div>
          ) : advice ? (
            <p className="text-balance py-2 animate-fade-in">
              {advice.message}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Add some food items to get personalized advice.
            </p>
          )}
        </div>
        
        {dailyNutrition.items.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={fetchNutritionAdvice}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh advice
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
