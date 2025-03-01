
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/types";
import { Trash2, Clock } from "lucide-react";

interface FoodListProps {
  items: FoodItem[];
  onRemoveItem: (id: string) => void;
}

export function FoodList({ items, onRemoveItem }: FoodListProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (items.length === 0) {
    return (
      <Card className="overflow-hidden bg-muted/20 border-dashed animate-fade-in">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No meals logged yet today.</p>
          <p className="text-sm text-muted-foreground">Use the form above to add what you've eaten.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>Today's Meals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item, index) => (
            <li 
              key={item.id} 
              className={`px-6 py-4 flex justify-between items-center hover:bg-muted/20 transition-colors
                ${index === items.length - 1 ? 'animate-slide-up' : ''}`}
            >
              <div className="space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium">{item.name}</h4>
                  <span className="text-sm text-muted-foreground ml-2">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock size={14} className="mr-1" />
                  <span>{formatTime(new Date(item.timestamp))}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{item.calories} kcal</p>
                  <p className="text-xs text-muted-foreground">
                    {item.protein}g P · {item.carbs}g C · {item.fat}g F
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
