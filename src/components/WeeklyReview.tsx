import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import {
  Check,
  CircleAlert,
  Info,
  LineChart,
  ClipboardList,
  Target,
  Calendar,
  Settings
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constants';
import { UserProfile } from '@/types';

interface WeeklyReviewSummary {
  period: string;
  daysTracked: number;
  avgCalories: number;
  avgProtein: number;
  calorieAdherence: string;
  targetCalories: number;
}

interface WeeklyInsight {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface NextWeekFocus {
  title: string;
  content: string;
  type: string;
}

interface WeeklyReviewData {
  summary: WeeklyReviewSummary;
  insights: WeeklyInsight[];
  nextWeekFocus: NextWeekFocus;
}

interface WeeklyReviewProps {
  userProfile: UserProfile | null;
}

export function WeeklyReview({ userProfile }: WeeklyReviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyReviewData | null>(null);
  const { toast } = useToast();

  const getWeeklyReview = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to access your weekly review',
          variant: 'destructive',
        });
        return;
      }

      if (!userProfile) {
        toast({
          title: 'Profile required',
          description: 'Please complete your profile to get a weekly review',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/openai/progress-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get weekly review');
      }

      const data = await response.json();
      setWeeklyData(data.weeklyReview);
    } catch (error) {
      console.error('Error getting weekly review:', error);
      toast({
        title: 'Error',
        description: 'Failed to get weekly review. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900';
    }
  };

  const getProgressColor = (adherence: number) => {
    if (adherence < 80 || adherence > 120) {
      return 'bg-amber-500';
    } else if (adherence >= 95 && adherence <= 105) {
      return 'bg-green-500';
    } else {
      return 'bg-blue-500';
    }
  };

  const renderWeeklyReview = () => {
    if (!weeklyData) return null;

    const {
      summary,
      insights,
      nextWeekFocus
    } = weeklyData;

    const adherencePercent = parseInt(summary.calorieAdherence.replace('%', ''));

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-muted/40 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium">Weekly Summary</h3>
            </div>
            <Badge variant="outline">{summary.period}</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Days Tracked</p>
              <p className="text-xl font-bold">{summary.daysTracked} <span className="text-xs font-normal text-muted-foreground">/ 7</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Calories</p>
              <p className="text-xl font-bold">{summary.avgCalories}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Protein</p>
              <p className="text-xl font-bold">{summary.avgProtein}g</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Calorie Target Adherence</span>
              <span className="font-medium">{summary.calorieAdherence}</span>
            </div>
            <Progress 
              value={Math.min(adherencePercent, 150)} 
              className="h-2" 
              indicatorClassName={getProgressColor(adherencePercent)}
            />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>0%</span>
              <span>Target: {summary.targetCalories} cal</span>
              <span>150%</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Weekly Insights</h3>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <Card key={index} className={`border ${getTypeClass(insight.type)}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {getTypeIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="pt-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{nextWeekFocus.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{nextWeekFocus.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Weekly Progress Review
        </CardTitle>
        <CardDescription>
          Review your nutrition trends and get personalized insights on your progress
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!userProfile ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">
              Please complete your profile to get a personalized weekly progress review.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/profile'}
            >
              <Settings size={16} className="mr-2" />
              Complete Your Profile
            </Button>
          </div>
        ) : !weeklyData ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="text-center space-y-2 max-w-sm">
              <p className="text-muted-foreground text-sm">
                Get a personalized analysis of your weekly nutrition trends, patterns, and areas for improvement.
              </p>
              <p className="text-xs text-muted-foreground">
                This review will analyze your average calorie intake, protein consumption, tracking consistency, and provide targeted recommendations.
              </p>
            </div>
            <Button
              onClick={getWeeklyReview}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Generating review...' : 'Generate Weekly Review'}
            </Button>
          </div>
        ) : (
          renderWeeklyReview()
        )}
      </CardContent>
      
      {weeklyData && (
        <CardFooter className="flex justify-end border-t pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeeklyData(null)}
          >
            Back
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}