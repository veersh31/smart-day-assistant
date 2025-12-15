import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Clock, 
  Users, 
  TrendingUp,
  Calendar,
  X,
  Check,
  Zap
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

const typeConfig = {
  reschedule: { 
    icon: Clock, 
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
    gradient: 'from-info/10 to-info/5'
  },
  delegation: { 
    icon: Users, 
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    gradient: 'from-warning/10 to-warning/5'
  },
  priority: { 
    icon: TrendingUp, 
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    gradient: 'from-primary/10 to-primary/5'
  },
  time_block: { 
    icon: Calendar, 
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    gradient: 'from-success/10 to-success/5'
  },
};

export function RecommendationCard({ recommendation, onDismiss, onApply }: RecommendationCardProps) {
  const config = typeConfig[recommendation.type as keyof typeof typeConfig] || typeConfig.priority;
  const Icon = config.icon;

  if (recommendation.is_dismissed || recommendation.is_applied) return null;

  return (
    <Card className={cn(
      "border-l-4 animate-slide-up overflow-hidden group hover:shadow-lg transition-all duration-300",
      config.border.replace('/20', '/50')
    )}>
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        config.gradient
      )} />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110",
            config.bg
          )}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-subtle" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                AI Insight
              </span>
            </div>
            
            <h3 className="font-semibold text-foreground leading-tight">
              {recommendation.title}
            </h3>
            
            {recommendation.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {recommendation.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-4">
              <Button 
                size="sm" 
                onClick={() => onApply(recommendation.id)}
                className="h-8 gap-1.5 shadow-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onDismiss(recommendation.id)}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
