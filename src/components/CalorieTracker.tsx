import { useState, useEffect } from "react";
import { FoodInput } from "./FoodInput";
import { NutritionSummary } from "./NutritionSummary";
import { FoodList } from "./FoodList";
import { NutritionistAI } from "./NutritionistAI";
import { CalorieChart } from "./CalorieChart";
import { UserProfileForm } from "./UserProfileForm";
import { DailyNutrition, FoodItem, UserProfile } from "@/types";
import { addFoodItem, removeFoodItem, initializeDailyNutrition } from "@/lib/calorieUtils";
import { useToast } from "@/hooks/use-toast";

interface CalorieTrackerProps {
  initialUserProfile: UserProfile | null;
}

export function CalorieTracker({ initialUserProfile }: CalorieTrackerProps) {
  const [showProfileForm, setShowProfileForm] = useState(!initialUserProfile);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>(initializeDailyNutrition());
  const { toast } = useToast();
  
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
  
  // Handle profile completion
  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowProfileForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {showProfileForm ? (
        <UserProfileForm onProfileComplete={handleProfileComplete} />
      ) : (
        userProfile && (
          <>
            <FoodInput onAddFood={handleAddFood} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="md:col-span-2">
                <NutritionSummary nutrition={dailyNutrition} userProfile={userProfile} />
              </div>
              <div>
                <NutritionistAI 
                  userProfile={userProfile} 
                  dailyNutrition={dailyNutrition} 
                  onAddFoodItem={(item) => setDailyNutrition(prev => addFoodItem(prev, item))}
                />
              </div>
            </div>
            
            <CalorieChart 
              nutrition={dailyNutrition} 
              userProfile={userProfile}
            />
            
            <FoodList 
              items={dailyNutrition.items} 
              onRemoveItem={handleRemoveFood}
            />
          </>
        )
      )}
    </div>
  );
}
