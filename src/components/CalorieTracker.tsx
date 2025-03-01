
import { useState, useEffect } from "react";
import { FoodInput } from "./FoodInput";
import { NutritionSummary } from "./NutritionSummary";
import { FoodList } from "./FoodList";
import { NutritionistAI } from "./NutritionistAI";
import { CalorieChart } from "./CalorieChart";
import { DailyNutrition, FoodItem, UserProfile } from "@/types";
import { addFoodItem, removeFoodItem, initializeDailyNutrition, calculateMaintenanceCalories, calculateTargetCalories } from "@/lib/calorieUtils";
import { useToast } from "@/hooks/use-toast";

export function CalorieTracker() {
  // In a real app, this would come from user settings or onboarding
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "User",
    weight: 70, // kg
    height: 170, // cm
    age: 30,
    gender: "male",
    activityLevel: "moderate",
    goal: "maintain",
    maintenanceCalories: 2200,
    targetCalories: 2200
  });
  
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>(initializeDailyNutrition());
  const { toast } = useToast();
  
  // Initialize user profile with calculated values
  useEffect(() => {
    const maintenance = calculateMaintenanceCalories({
      name: userProfile.name,
      weight: userProfile.weight,
      height: userProfile.height,
      age: userProfile.age,
      gender: userProfile.gender,
      activityLevel: userProfile.activityLevel,
      goal: userProfile.goal
    });
    
    const target = calculateTargetCalories(maintenance, userProfile.goal);
    
    setUserProfile(prev => ({
      ...prev,
      maintenanceCalories: maintenance,
      targetCalories: target
    }));
  }, []);
  
  // Handle adding a new food item
  const handleAddFood = (food: FoodItem) => {
    setDailyNutrition(prev => addFoodItem(prev, food));
  };
  
  // Handle removing a food item
  const handleRemoveFood = (id: string) => {
    setDailyNutrition(prev => removeFoodItem(prev, id));
    toast({
      title: "Item removed",
      description: "The food item has been removed from your log",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <FoodInput onAddFood={handleAddFood} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NutritionSummary 
          nutrition={dailyNutrition} 
          userProfile={userProfile}
        />
        <NutritionistAI 
          userProfile={userProfile} 
          dailyNutrition={dailyNutrition}
        />
      </div>
      
      <CalorieChart 
        nutrition={dailyNutrition} 
        userProfile={userProfile}
      />
      
      <FoodList 
        items={dailyNutrition.items} 
        onRemoveItem={handleRemoveFood}
      />
    </div>
  );
}
