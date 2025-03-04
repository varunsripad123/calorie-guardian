import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Utensils, Clock, Plus, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constants';
import { UserProfile } from '@/types';

interface Meal {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  recipe?: string;
}

interface MealPlan {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
}

interface MealPlannerProps {
  userProfile?: UserProfile;
}

export function MealPlanner({ userProfile }: MealPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealCount, setMealCount] = useState('3');
  const [cuisinePreference, setCuisinePreference] = useState('');
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const generateMealPlan = async () => {
    setIsLoading(true);
    
    // Show loading toast
    toast({
      title: 'Generating meal plan',
      description: 'This may take up to 30 seconds...',
    });
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to use this feature',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        mealCount: parseInt(mealCount),
        cuisinePreference: cuisinePreference || undefined,
      };
      
      // If we have user profile data, include it directly in the request
      if (userProfile) {
        Object.assign(payload, { userProfile });
      }
      
      const response = await fetch(`${API_BASE_URL}/openai/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      
      if (!data.success || !data.mealPlan) {
        throw new Error('Invalid meal plan data received from server');
      }
      
      // Ensure meal plan data has the expected structure
      const validatedMealPlan = {
        totalCalories: data.mealPlan.totalCalories || 0,
        totalProtein: data.mealPlan.totalProtein || 0,
        totalCarbs: data.mealPlan.totalCarbs || 0,
        totalFat: data.mealPlan.totalFat || 0,
        meals: Array.isArray(data.mealPlan.meals) ? data.mealPlan.meals.map(meal => ({
          name: meal.name || 'Unnamed Meal',
          type: meal.type || 'other',
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
          recipe: meal.recipe || ''
        })) : []
      };
      
      setMealPlan(validatedMealPlan);
      // Reset expanded state when a new meal plan is generated
      setExpandedMeals({});
      
      // Show success message
      toast({
        title: 'Meal plan generated',
        description: `Created a plan with ${validatedMealPlan.meals.length} meals (${validatedMealPlan.totalCalories} calories)`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // Show a helpful error message
      toast({
        title: 'Error',
        description: 'Failed to generate meal plan. Please try again later.',
        variant: 'destructive',
      });
      
      // Provide a fallback meal plan with a message for better user experience
      
      // Try to extract error details
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // @ts-ignore
        errorMessage = error.message || JSON.stringify(error);
      }
      
      const isApiKeyError = errorMessage.toLowerCase().includes('api key') || 
                           errorMessage.toLowerCase().includes('authentication') ||
                           errorMessage.toLowerCase().includes('unauthorized');
      
      setMealPlan({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: [{
          name: "Could not generate meal plan",
          type: "other",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          ingredients: ["Technical issue encountered"],
          recipe: isApiKeyError 
            ? "There was an issue with the AI service authentication. This may be due to a missing or invalid API key. Please check your profile settings to add a valid OpenAI API key or try again later."
            : "We're experiencing technical difficulties with our meal plan generation. Please try again later or check if your profile information is complete."
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMealExpand = (index: number) => {
    // Create unique IDs for meals to avoid issues with indexing
    const uniqueId = `meal-${index}`;
    setExpandedMeals(prev => {
      const newState = { ...prev };
      newState[uniqueId] = !prev[uniqueId];
      return newState;
    });
  };
  
  // Safe helper to check if a meal is expanded
  const isMealExpanded = (index: number): boolean => {
    const uniqueId = `meal-${index}`;
    return !!expandedMeals[uniqueId];
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Meal Planner
        </CardTitle>
        <CardDescription>Generate a personalized meal plan based on your profile</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealCount">Number of Meals</Label>
              <Select value={mealCount} onValueChange={setMealCount}>
                <SelectTrigger id="mealCount">
                  <SelectValue placeholder="Select number of meals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Meals</SelectItem>
                  <SelectItem value="4">4 Meals (with snack)</SelectItem>
                  <SelectItem value="5">5 Meals (with 2 snacks)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cuisineType">Cuisine Preference (Optional)</Label>
              <Select value={cuisinePreference} onValueChange={setCuisinePreference}>
                <SelectTrigger id="cuisineType">
                  <SelectValue placeholder="Any cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any cuisine</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Asian">Asian</SelectItem>
                  <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="Mexican">Mexican</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={generateMealPlan} 
            disabled={isLoading || !userProfile} 
            className="w-full"
            title={!userProfile ? "Complete your profile first" : ""}
          >
            {isLoading ? 'Generating...' : 'Generate Meal Plan'}
          </Button>
          
          {!mealPlan && !isLoading && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/20 text-center">
              {!userProfile ? (
                <>
                  <p className="text-muted-foreground mb-2">
                    Complete your profile first to generate a personalized meal plan.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your personal information is needed to create tailored meals for your nutritional needs.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.href = '/profile'}
                  >
                    <Settings size={14} className="mr-1" />
                    Go to Profile
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">
                    Click the button above to generate a personalized meal plan based on your profile.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The AI will create meals tailored to your nutritional needs, dietary preferences, and calorie targets.
                  </p>
                </>
              )}
            </div>
          )}
          
          {mealPlan && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                <div>
                  <h3 className="font-medium">Daily Nutrition Totals</h3>
                  <p className="text-sm text-muted-foreground">Based on your profile and preferences</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{mealPlan.totalCalories} calories</p>
                  <p className="text-sm text-muted-foreground">
                    P: {mealPlan.totalProtein}g / C: {mealPlan.totalCarbs}g / F: {mealPlan.totalFat}g
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="breakfast" className="flex-1">Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch" className="flex-1">Lunch</TabsTrigger>
                  <TabsTrigger value="dinner" className="flex-1">Dinner</TabsTrigger>
                  <TabsTrigger value="snack" className="flex-1">Snacks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4 mt-4">
                  {mealPlan.meals.map((meal, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">{meal.type}</p>
                            <CardTitle className="text-lg">{meal.name}</CardTitle>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{meal.calories} calories</p>
                            <p className="text-xs text-muted-foreground">
                              P: {meal.protein}g / C: {meal.carbs}g / F: {meal.fat}g
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {meal.ingredients.map((ingredient, i) => (
                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              {ingredient}
                            </span>
                          ))}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs justify-start p-0 h-auto"
                          onClick={() => toggleMealExpand(index)}
                        >
                          {isMealExpanded(index) ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          {isMealExpanded(index) ? 'Hide recipe' : 'Show recipe'}
                        </Button>
                        
                        {isMealExpanded(index) && meal.recipe && (
                          <div className="mt-2 text-sm border-t pt-2 animate-fade-in">
                            <p className="text-muted-foreground">{meal.recipe}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                  <TabsContent key={mealType} value={mealType} className="space-y-4 mt-4">
                    {mealPlan.meals
                      .filter(meal => {
                        // Case-insensitive matching for meal types
                        const lowerMealType = meal.type.toLowerCase();
                        return lowerMealType === mealType || 
                               // Handle common variations
                               (mealType === 'breakfast' && lowerMealType.includes('breakfast')) ||
                               (mealType === 'lunch' && lowerMealType.includes('lunch')) ||
                               (mealType === 'dinner' && lowerMealType.includes('dinner')) ||
                               (mealType === 'snack' && (lowerMealType.includes('snack') || lowerMealType.includes('dessert')));
                      })
                      .map((meal, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="p-4 pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">{meal.type}</p>
                                <CardTitle className="text-lg">{meal.name}</CardTitle>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{meal.calories} calories</p>
                                <p className="text-xs text-muted-foreground">
                                  P: {meal.protein}g / C: {meal.carbs}g / F: {meal.fat}g
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {meal.ingredients.map((ingredient, i) => (
                                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs justify-start p-0 h-auto"
                              onClick={() => toggleMealExpand(index)}
                            >
                              {isMealExpanded(index) ? (
                                <ChevronUp className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              )}
                              {isMealExpanded(index) ? 'Hide recipe' : 'Show recipe'}
                            </Button>
                            
                            {isMealExpanded(index) && meal.recipe && (
                              <div className="mt-2 text-sm border-t pt-2 animate-fade-in">
                                <p className="text-muted-foreground">{meal.recipe}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}