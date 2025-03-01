
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyNutrition, UserProfile } from "@/types";
import { Flame, Beef, Grain, Droplet } from "lucide-react";

interface NutritionSummaryProps {
  nutrition: DailyNutrition;
  userProfile: UserProfile;
}

export function NutritionSummary({ nutrition, userProfile }: NutritionSummaryProps) {
  const caloriePercentage = Math.min(
    Math.round((nutrition.totalCalories / userProfile.targetCalories) * 100),
    100
  );
  
  const getTrend = () => {
    if (nutrition.totalCalories > userProfile.targetCalories) {
      return "over";
    } else if (nutrition.totalCalories > userProfile.targetCalories * 0.9) {
      return "close";
    } else {
      return "under";
    }
  };
  
  const trend = getTrend();
  
  const getTrendBadge = () => {
    switch (trend) {
      case "over":
        return <Badge variant="destructive" className="animate-fade-in">Over Target</Badge>;
      case "close":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 animate-fade-in">Almost There</Badge>;
      case "under":
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 animate-fade-in">Under Target</Badge>;
    }
  };
  
  const getCalorieProgressColor = () => {
    switch (trend) {
      case "over":
        return "bg-destructive";
      case "close":
        return "bg-amber-500";
      case "under":
      default:
        return "bg-primary";
    }
  };

  return (
    <Card className="overflow-hidden transition-all animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Today's Nutrition</CardTitle>
          {getTrendBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Flame size={14} className="text-primary" />
                </div>
                <span className="font-medium">Calories</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{nutrition.totalCalories}</span>
                <span className="text-muted-foreground text-sm ml-1">/ {userProfile.targetCalories}</span>
              </div>
            </div>
            <Progress value={caloriePercentage} className="h-2 bg-primary/10">
              <div className={`h-full ${getCalorieProgressColor()} transition-all duration-500`} />
            </Progress>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <Beef size={14} className="text-blue-500" />
                </div>
                <span className="text-sm font-medium">Protein</span>
              </div>
              <p className="text-xl font-semibold">
                {nutrition.totalProtein}
                <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center">
                  <Grain size={14} className="text-amber-500" />
                </div>
                <span className="text-sm font-medium">Carbs</span>
              </div>
              <p className="text-xl font-semibold">
                {nutrition.totalCarbs}
                <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-purple-50 flex items-center justify-center">
                  <Droplet size={14} className="text-purple-500" />
                </div>
                <span className="text-sm font-medium">Fat</span>
              </div>
              <p className="text-xl font-semibold">
                {nutrition.totalFat}
                <span className="text-sm font-normal text-muted-foreground ml-1">g</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
