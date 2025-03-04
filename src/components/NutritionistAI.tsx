
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile, DailyNutrition, NutritionAdvice, FoodItem } from "@/types";
import { generateId } from "@/lib/calorieUtils";
import { Sparkles, RefreshCw, Bot, Search, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";

interface NutritionistAIProps {
  userProfile: UserProfile;
  dailyNutrition: DailyNutrition;
  onAddFoodItem?: (item: FoodItem) => void;
}

export function NutritionistAI({ userProfile, dailyNutrition, onAddFoodItem }: NutritionistAIProps) {
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foodInput, setFoodInput] = useState("");
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      // Verify token validity by making a request to the backend
      verifyAuthentication(token);
    }
  }, []);

  // Verify if the stored token is valid
  const verifyAuthentication = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If token is invalid, reset authentication
        setIsAuthenticated(false);
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Error verifying authentication:", error);
      setIsAuthenticated(false);
    }
  };

  const fetchNutritionAdvice = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_BASE_URL}/openai/nutrition-advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to get nutrition advice");
      }

      setAdvice(data.advice);
    } catch (error) {
      console.error("Error fetching nutrition advice:", error);
      setAdvice({
        message: "I couldn't analyze your nutrition right now. Please try again or check if our server is experiencing issues.",
        type: "error"
      });
      toast({
        title: "Error",
        description: "Failed to get nutrition advice. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFoodWithAI = async () => {
    if (!foodInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a food item to analyze",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use this feature",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzingFood(true);
    try {
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_BASE_URL}/openai/analyze-food`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          foodDescription: foodInput
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to analyze food");
      }
      
      // Create a food item
      const foodItem: FoodItem = {
        id: generateId(),
        name: data.food.name,
        quantity: data.food.quantity,
        calories: data.food.calories,
        protein: data.food.protein,
        carbs: data.food.carbs,
        fat: data.food.fat,
        timestamp: new Date(),
        aiGenerated: true
      };
      
      // Add the food item
      if (onAddFoodItem) {
        onAddFoodItem(foodItem);
        setFoodInput("");
        toast({
          title: "Food analyzed",
          description: `Added ${foodItem.name} (${foodItem.calories} calories)`,
        });
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast({
        title: "Error",
        description: "Failed to analyze food. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingFood(false);
    }
  };

  // Fetch advice when component mounts or nutrition changes
  useEffect(() => {
    if (isAuthenticated) {
      if (dailyNutrition.items.length > 0) {
        // Get advice when food items exist
        fetchNutritionAdvice();
      } else {
        // Show a default message prompting user to add food
        setAdvice({
          message: `Based on your profile (${userProfile.gender}, ${userProfile.age} years, ${userProfile.weight}kg, ${userProfile.height}cm) with a ${userProfile.goal} goal, you should aim for around ${userProfile.targetCalories} calories today. Try adding some food items to get personalized recommendations.`,
          type: "info"
        });
      }
    }
  }, [dailyNutrition.items.length, dailyNutrition.totalCalories, isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <Card className="overflow-hidden transition-all duration-300 animate-fade-in">
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
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please sign in to access the AI nutrition coach features.
            </p>
            <Button 
              className="w-full"
              onClick={() => window.location.href = "/login"}
            >
              <LogIn size={16} className="mr-2" />
              Sign In
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              After signing up, you can start using AI features right away with our shared API key. You can also set your own OpenAI API key in your profile settings for enhanced privacy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        
        {onAddFoodItem && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Analyze food with AI</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter food (e.g., 'large cheese pizza')"
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                disabled={isAnalyzingFood}
              />
              <Button 
                variant="secondary" 
                onClick={analyzeFoodWithAI}
                disabled={isAnalyzingFood || !foodInput.trim()}
              >
                {isAnalyzingFood ? (
                  <Sparkles size={16} className="mr-2 animate-pulse" />
                ) : (
                  <Search size={16} className="mr-2" />
                )}
                {isAnalyzingFood ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Let AI estimate the calories and nutrients in your food
            </p>
          </div>
        )}
        
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
        
        <div className="flex gap-2">
          {dailyNutrition.items.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={fetchNutritionAdvice}
              disabled={isLoading}
            >
              <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh advice
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-none"
            onClick={() => window.location.href = "/profile"}
          >
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
