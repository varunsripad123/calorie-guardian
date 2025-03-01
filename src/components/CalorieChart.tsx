
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyNutrition, UserProfile } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CalorieChartProps {
  nutrition: DailyNutrition;
  userProfile: UserProfile;
}

export function CalorieChart({ nutrition, userProfile }: CalorieChartProps) {
  // For a real app, this would include historical data
  // For now, we'll create mock data for visualization
  const generateMockData = () => {
    const today = new Date();
    const data = [];
    
    // Create data for the past week
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      
      // Today's actual data
      if (i === 0) {
        data.push({
          name: "Today",
          calories: nutrition.totalCalories,
          protein: nutrition.totalProtein,
          carbs: nutrition.totalCarbs,
          fat: nutrition.totalFat
        });
        continue;
      }
      
      // Mock data for previous days
      const mockCalories = Math.round(
        userProfile.targetCalories * (0.85 + Math.random() * 0.3)
      );
      
      data.push({
        name: dayName,
        calories: mockCalories,
        protein: Math.round(mockCalories * 0.2 / 4), // 20% of calories from protein
        carbs: Math.round(mockCalories * 0.5 / 4),   // 50% of calories from carbs
        fat: Math.round(mockCalories * 0.3 / 9)      // 30% of calories from fat
      });
    }
    
    return data;
  };
  
  const data = generateMockData();
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass p-3 rounded-md text-sm shadow-md">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-primary font-semibold">
            {`Calories: ${payload[0].value}`}
          </p>
          {payload[0].payload.protein && (
            <>
              <p className="text-blue-500">{`Protein: ${payload[0].payload.protein}g`}</p>
              <p className="text-amber-500">{`Carbs: ${payload[0].payload.carbs}g`}</p>
              <p className="text-purple-500">{`Fat: ${payload[0].payload.fat}g`}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-0">
        <CardTitle>Calorie History</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              hide
              domain={[0, userProfile.targetCalories * 1.2]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <ReferenceLine
              y={userProfile.targetCalories}
              stroke="var(--primary)"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                position: 'right',
                value: 'Target',
                fill: 'var(--primary)',
                fontSize: 12
              }}
            />
            <Bar
              dataKey="calories"
              radius={[4, 4, 0, 0]}
              fill="var(--primary)"
              fillOpacity={0.8}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
