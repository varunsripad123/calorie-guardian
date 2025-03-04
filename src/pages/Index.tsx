
import { CalorieTracker } from "@/components/CalorieTracker";
import { MealPlanner } from "@/components/MealPlanner";
import { NutritionCoach } from "@/components/NutritionCoach";
import { WeeklyReview } from "@/components/WeeklyReview";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed, 
  BookOpen, 
  BarChart, 
  Heart,
  CalendarRange
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

const Index = () => {
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        if (data.profile) {
          setUserProfile({
            name: data.profile.name || '',
            weight: data.profile.weight || 0,
            height: data.profile.height || 0,
            age: data.profile.age || 0,
            gender: data.profile.gender || 'other',
            activityLevel: data.profile.activityLevel || 'moderate',
            goal: data.profile.goal || 'maintain',
            nationality: data.profile.nationality || '',
            dietaryPreferences: data.profile.dietaryPreferences || [],
            maintenanceCalories: data.profile.maintenanceCalories || 0,
            targetCalories: data.profile.targetCalories || 0
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto mb-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center h-12 px-6 mb-4 font-medium bg-primary/10 text-primary rounded-full">
            <span>Your Personal AI Nutrition Mentor</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Calorie Guardian</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Develop healthier eating habits with personalized guidance, insights, and support tailored to your unique needs.
          </p>
        </div>
        
        <Tabs defaultValue="tracker" className="max-w-4xl mx-auto">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'} mb-6`}>
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <UtensilsCrossed size={isMobile ? 16 : 18} />
              <span className={isMobile ? 'hidden' : 'inline'}>Food Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <BookOpen size={isMobile ? 16 : 18} />
              <span className={isMobile ? 'hidden' : 'inline'}>Coach</span>
            </TabsTrigger>
            <TabsTrigger value="meal-planner" className="flex items-center gap-2">
              <Heart size={isMobile ? 16 : 18} />
              <span className={isMobile ? 'hidden' : 'inline'}>Meal Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart size={isMobile ? 16 : 18} />
              <span className={isMobile ? 'hidden' : 'inline'}>Progress</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="mt-0 space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your profile data...</div>
            ) : (
              <CalorieTracker initialUserProfile={userProfile} />
            )}
          </TabsContent>
          
          <TabsContent value="coach" className="mt-0 space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your profile data...</div>
            ) : (
              <NutritionCoach userProfile={userProfile} />
            )}
          </TabsContent>
          
          <TabsContent value="meal-planner" className="mt-0 space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your profile data...</div>
            ) : (
              <MealPlanner userProfile={userProfile} />
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0 space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your profile data...</div>
            ) : (
              <WeeklyReview userProfile={userProfile} />
            )}
          </TabsContent>
        </Tabs>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground animate-fade-in">
          <p>Powered by AI • Made by Varun Sripad Kota</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
