import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    value: 'text-foreground',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-foreground',
  },
  accent: {
    icon: 'bg-accent/10 text-accent-foreground',
    value: 'text-foreground',
  },
  success: {
    icon: 'bg-success/10 text-success',
    value: 'text-foreground',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    value: 'text-foreground',
  },
};

export function EnhancedStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'primary',
  className
}: EnhancedStatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "border border-border bg-card hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Text content */}
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <p className={cn(
                "text-3xl font-semibold tracking-tight",
                styles.value
              )}>
                {value}
              </p>
              {trend && (
                <span className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  trend.direction === 'up' && "text-success",
                  trend.direction === 'down' && "text-destructive",
                  trend.direction === 'neutral' && "text-muted-foreground"
                )}>
                  {trend.direction === 'up' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {trend.direction === 'down' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right side: Icon */}
          <div className={cn(
            "p-3 rounded-lg",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
