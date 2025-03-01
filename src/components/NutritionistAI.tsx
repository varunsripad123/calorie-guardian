
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile, DailyNutrition, NutritionAdvice } from "@/types";
import { generateNutritionAdvicePrompt } from "@/lib/calorieUtils";
import { Sparkles, RefreshCw, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NutritionistAIProps {
  userProfile: UserProfile;
  dailyNutrition: DailyNutrition;
}

export function NutritionistAI({ userProfile, dailyNutrition }: NutritionistAIProps) {
  const [advice, setAdvice] = useState<NutritionAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage if available
  useEffect(() => {
    const savedApiKey = localStorage.getItem("geminiApiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("geminiApiKey", key);
    setShowApiKeyInput(false);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
    // Fetch advice immediately after saving API key
    if (dailyNutrition.items.length > 0) {
      fetchNutritionAdvice();
    }
  };

  const fetchNutritionAdvice = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    try {
      const prompt = generateNutritionAdvicePrompt(dailyNutrition, userProfile);
      
      // Call Gemini API
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to get nutrition advice");
      }

      // Extract the text response from Gemini
      const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Determine advice type based on content
      let type: NutritionAdvice["type"] = "info";
      if (geminiResponse.toLowerCase().includes("warning") || geminiResponse.toLowerCase().includes("caution")) {
        type = "warning";
      } else if (geminiResponse.toLowerCase().includes("excellent") || geminiResponse.toLowerCase().includes("great job")) {
        type = "success";
      } else if (geminiResponse.toLowerCase().includes("error") || geminiResponse.toLowerCase().includes("problem")) {
        type = "error";
      }

      setAdvice({ message: geminiResponse, type });
    } catch (error) {
      console.error("Error fetching nutrition advice:", error);
      setAdvice({
        message: "I couldn't analyze your nutrition right now. Please check your API key or try again later.",
        type: "error"
      });
      toast({
        title: "Error",
        description: "Failed to get nutrition advice. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch advice when component mounts or nutrition changes significantly
  useEffect(() => {
    if (dailyNutrition.items.length > 0 && apiKey) {
      fetchNutritionAdvice();
    }
  }, [dailyNutrition.totalCalories, apiKey]);

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

  if (showApiKeyInput) {
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
              Please enter your Gemini API key to get personalized nutrition advice.
            </p>
            <input 
              type="password" 
              placeholder="Enter Gemini API key"
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button 
              className="w-full"
              onClick={() => saveApiKey(apiKey)}
              disabled={!apiKey}
            >
              <Sparkles size={16} className="mr-2" />
              Save API Key
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Your API key will be stored locally and never sent to our servers.
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
            onClick={() => setShowApiKeyInput(true)}
          >
            API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
