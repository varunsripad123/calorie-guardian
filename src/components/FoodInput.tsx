
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { FoodItem } from "@/types";
import { generateFoodAnalysisPrompt, generateId } from "@/lib/calorieUtils";
import { useToast } from "@/hooks/use-toast";

interface FoodInputProps {
  onAddFood: (food: FoodItem) => void;
}

export function FoodInput({ onAddFood }: FoodInputProps) {
  const [foodInput, setFoodInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoodInput(e.target.value);
  };

  const analyzeFood = async () => {
    if (!foodInput.trim()) {
      toast({
        title: "Please enter a food item",
        description: "Try something like '2 eggs and toast' or 'chicken salad'",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // In a real application, this would call the Gemini API
      // For demonstration, we're simulating a response
      
      const prompt = generateFoodAnalysisPrompt(foodInput);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response logic based on the input
      let mockResponse;
      const lowercaseInput = foodInput.toLowerCase();
      
      if (lowercaseInput.includes("apple")) {
        mockResponse = {
          name: "Apple",
          quantity: "1 medium",
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3
        };
      } else if (lowercaseInput.includes("egg")) {
        mockResponse = {
          name: lowercaseInput.includes("2") ? "Eggs" : "Egg",
          quantity: lowercaseInput.includes("2") ? "2 large" : "1 large",
          calories: lowercaseInput.includes("2") ? 140 : 70,
          protein: lowercaseInput.includes("2") ? 12 : 6,
          carbs: lowercaseInput.includes("2") ? 0.8 : 0.4,
          fat: lowercaseInput.includes("2") ? 10 : 5
        };
      } else if (lowercaseInput.includes("salad")) {
        mockResponse = {
          name: "Mixed Salad",
          quantity: "1 bowl",
          calories: 150,
          protein: 3,
          carbs: 10,
          fat: 10
        };
      } else if (lowercaseInput.includes("chicken")) {
        mockResponse = {
          name: "Grilled Chicken Breast",
          quantity: "100g",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6
        };
      } else if (lowercaseInput.includes("rice")) {
        mockResponse = {
          name: "White Rice",
          quantity: "1 cup cooked",
          calories: 205,
          protein: 4.3,
          carbs: 45,
          fat: 0.4
        };
      } else {
        // Generic response for any other input
        mockResponse = {
          name: foodInput,
          quantity: "1 serving",
          calories: Math.floor(Math.random() * 300) + 100,
          protein: Math.floor(Math.random() * 20) + 1,
          carbs: Math.floor(Math.random() * 30) + 5,
          fat: Math.floor(Math.random() * 15) + 1
        };
      }
      
      const foodItem: FoodItem = {
        id: generateId(),
        ...mockResponse,
        timestamp: new Date(),
        aiGenerated: true
      };
      
      onAddFood(foodItem);
      
      toast({
        title: "Food analyzed!",
        description: `Added ${foodItem.name} (${foodItem.calories} calories)`,
      });
      
      setFoodInput("");
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast({
        title: "Couldn't analyze food",
        description: "Please try again with a more specific description",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeFood();
  };

  return (
    <Card className="glass border border-border/20 shadow-sm animate-fade-in">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="What did you eat? (e.g., '2 eggs with toast')"
              value={foodInput}
              onChange={handleChange}
              className="pr-10 h-12 transition-all border-primary/20 focus:border-primary/40"
              disabled={isAnalyzing}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/40">
              <Sparkles size={16} className={isAnalyzing ? "animate-pulse" : ""} />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isAnalyzing}
            className="h-12 px-6"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
