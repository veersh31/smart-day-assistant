import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Clock, 
  Users, 
  TrendingUp,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string | null;
  is_dismissed: boolean;
  is_applied: boolean;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
  onApply: (id: string) => void;
}

const typeIcons = {
  reschedule: Clock,
  delegation: Users,
  priority: TrendingUp,
  time_block: Calendar,
};

const typeColors = {
  reschedule: 'text-info',
  delegation: 'text-warning',
  priority: 'text-primary',
  time_block: 'text-success',
};

const typeBgColors = {
  reschedule: 'bg-info/10',
  delegation: 'bg-warning/10',
  priority: 'bg-primary/10',
  time_block: 'bg-success/10',
};

export function RecommendationCard({ recommendation, onDismiss, onApply }: RecommendationCardProps) {
  const Icon = typeIcons[recommendation.type as keyof typeof typeIcons] || Sparkles;
  const iconColor = typeColors[recommendation.type as keyof typeof typeColors] || 'text-primary';
  const bgColor = typeBgColors[recommendation.type as keyof typeof typeBgColors] || 'bg-primary/10';

  if (recommendation.is_dismissed || recommendation.is_applied) return null;

  return (
    <Card className="border-l-4 border-l-primary animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", bgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI Recommendation</span>
            </div>
            
            <h3 className="font-medium text-foreground">
              {recommendation.title}
            </h3>
            
            {recommendation.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {recommendation.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={() => onApply(recommendation.id)}
                className="h-8"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDismiss(recommendation.id)}
                className="h-8"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
