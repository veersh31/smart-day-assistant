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
    glow: '',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    value: 'text-primary',
    glow: 'group-hover:shadow-glow',
  },
  accent: {
    icon: 'bg-accent/10 text-accent',
    value: 'text-accent',
    glow: 'group-hover:shadow-glow-accent',
  },
  success: {
    icon: 'bg-success/10 text-success',
    value: 'text-success',
    glow: '',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    value: 'text-warning',
    glow: '',
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
      "group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 hover:shadow-lg hover:border-primary/20",
      styles.glow,
      className
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Text content */}
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <p className={cn(
                "text-4xl font-bold tracking-tight tabular-nums",
                styles.value
              )}>
                {value}
              </p>
              {trend && (
                <span className={cn(
                  "text-sm font-semibold flex items-center gap-1",
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
              <p className="text-sm text-muted-foreground/80">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right side: Icon */}
          <div className={cn(
            "p-4 rounded-2xl transition-all duration-300",
            "group-hover:scale-110 group-hover:rotate-3",
            styles.icon
          )}>
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
