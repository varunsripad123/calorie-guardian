import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { 
  Book, 
  Brain, 
  Utensils, 
  Clock, 
  Droplets, 
  Check, 
  CircleAlert, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  Sparkles,
  Scale,
  Salad,
  Coffee,
  Settings
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constants';
import { UserProfile } from '@/types';

interface CoachingTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ActionItem {
  text: string;
  completed: boolean;
}

interface CoachingAdvice {
  title: string;
  content: string;
  actionItems: string[];
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NutritionCoachProps {
  userProfile: UserProfile | null;
}

export function NutritionCoach({ userProfile }: NutritionCoachProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coaching, setCoaching] = useState<CoachingAdvice | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [expandedContent, setExpandedContent] = useState(false);
  const { toast } = useToast();

  const topics: CoachingTopic[] = [
    {
      id: 'general',
      title: 'Personalized Nutrition Guidance',
      description: 'Get AI-powered nutrition advice based on your profile and food choices',
      icon: <Sparkles size={24} className="text-indigo-500" />
    },
    {
      id: 'portion-control',
      title: 'Mastering Portion Control',
      description: 'Learn practical strategies to manage portion sizes without measuring everything',
      icon: <Scale size={24} className="text-emerald-500" />
    },
    {
      id: 'mindful-eating',
      title: 'Mindful Eating Practices',
      description: 'Develop awareness around eating habits and enjoy food more consciously',
      icon: <Brain size={24} className="text-purple-500" />
    },
    {
      id: 'meal-prep',
      title: 'Effective Meal Preparation',
      description: 'Time-saving approaches to prepare healthy meals that fit your lifestyle',
      icon: <Utensils size={24} className="text-amber-500" />
    },
    {
      id: 'macro-balance',
      title: 'Balancing Your Macronutrients',
      description: 'Optimize protein, carbs and fats for your specific goals and preferences',
      icon: <Salad size={24} className="text-green-500" />
    },
    {
      id: 'hydration',
      title: 'Optimizing Hydration',
      description: 'Personalized hydration strategies based on your activity level and goals',
      icon: <Droplets size={24} className="text-blue-500" />
    },
    {
      id: 'eating-out',
      title: 'Navigating Restaurant Meals',
      description: 'Strategies to enjoy dining out while staying aligned with your nutrition goals',
      icon: <Coffee size={24} className="text-orange-500" />
    }
  ];

  const getCoaching = async (topic: string) => {
    setIsLoading(true);
    setSelectedTopic(topic);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to access coaching',
          variant: 'destructive',
        });
        return;
      }
      
      if (!userProfile) {
        toast({
          title: 'Profile required',
          description: 'Please complete your profile to get personalized coaching',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/openai/coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic,
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get coaching advice');
      }

      const data = await response.json();
      setCoaching(data.coaching);
      
      // Initialize action items as uncompleted
      setActionItems(data.coaching.actionItems.map((item: string) => ({
        text: item,
        completed: false
      })));
      
      // Reset expanded state
      setExpandedContent(false);
    } catch (error) {
      console.error('Error getting coaching:', error);
      
      let errorMessage = 'Failed to get coaching advice.';
      
      // Try to extract the actual error message from the response
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // @ts-ignore
        errorMessage = error.message || JSON.stringify(error);
      }
      
      // Set error-state advice to display in the UI
      setCoaching({
        title: "Unable to generate coaching advice",
        content: "There was an issue connecting to our AI service. This may be due to a missing or invalid API key. Please check your profile settings or try again later.",
        actionItems: [
          "Check your OpenAI API key in profile settings",
          "Verify your internet connection",
          "Try again in a few minutes",
          "Contact support if the issue persists"
        ],
        type: "error"
      });
      
      toast({
        title: 'AI Service Error',
        description: errorMessage || 'There was an issue connecting to our AI service. Please check your API key or try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActionItem = (index: number) => {
    setActionItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    );

    // Save to localStorage if needed
    // localStorage.setItem('actionItems', JSON.stringify(updatedItems));
  };

  const toggleContentExpand = () => {
    setExpandedContent(!expandedContent);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <CircleAlert className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <CircleAlert className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // This would be expanded to save/load action items from localStorage or backend

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Nutrition Coach
        </CardTitle>
        <CardDescription>
          Get personalized nutrition guidance and develop sustainable eating habits
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!userProfile ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">
              Please complete your profile to receive personalized coaching based on your specific needs.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/profile'}
            >
              <Settings size={16} className="mr-2" />
              Complete Your Profile
            </Button>
          </div>
        ) : !selectedTopic || !coaching ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a topic to receive personalized coaching based on your goals and preferences:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topics.map((topic) => (
                <Button
                  key={topic.id}
                  variant="outline"
                  className="h-auto py-3 px-4 justify-start text-left flex items-start gap-3 hover:bg-muted/50"
                  onClick={() => getCoaching(topic.id)}
                >
                  <div className="mt-0.5">{topic.icon}</div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{topic.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {topic.description}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-start gap-3">
              <div>
                {getTypeIcon(coaching.type)}
              </div>
              <div>
                <h3 className="text-lg font-medium">{coaching.title}</h3>
                <div className={`mt-1 text-sm text-muted-foreground ${expandedContent ? '' : 'line-clamp-3'}`}>
                  {coaching.content}
                </div>
                {coaching.content.length > 150 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={toggleContentExpand}
                  >
                    {expandedContent ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Read more
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">Action Items</h4>
              <ul className="space-y-2">
                {actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-5 w-5 rounded-full ${
                        item.completed ? 'bg-primary text-primary-foreground' : 'bg-background'
                      }`}
                      onClick={() => toggleActionItem(index)}
                    >
                      {item.completed && <Check className="h-3 w-3" />}
                    </Button>
                    <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTopic(null);
                  setCoaching(null);
                }}
              >
                Back to topics
              </Button>
              
              <Button size="sm" onClick={() => getCoaching('general')}>
                <ArrowRight className="h-4 w-4 mr-1" />
                Next tip
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}