import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-secondary text-foreground',
    value: 'text-foreground',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-primary',
  },
  accent: {
    icon: 'bg-accent/10 text-accent',
    value: 'text-accent',
  },
  success: {
    icon: 'bg-success/10 text-success',
    value: 'text-success',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    value: 'text-warning',
  },
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  variant = 'primary',
  className 
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative",
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && trendValue && (
              <p className={cn(
                "text-xs font-semibold flex items-center gap-1 mt-1",
                trend === 'up' && "text-success",
                trend === 'down' && "text-destructive",
                trend === 'neutral' && "text-muted-foreground"
              )}>
                {trend === 'up' && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trendValue}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
