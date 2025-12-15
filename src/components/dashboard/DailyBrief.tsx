import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sunrise, RefreshCw, Loader2 } from 'lucide-react';
import { langChainAPI } from '@/lib/langchain-api';
import { useTasks } from '@/hooks/useTasks';
import { useEvents } from '@/hooks/useEvents';

export function DailyBrief() {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { tasks } = useTasks();
  const { events } = useEvents();

  const generateBrief = async () => {
    setLoading(true);
    try {
      const tasksContext = tasks
        .slice(0, 5)
        .map(t => `${t.title} (${t.priority_level})`)
        .join(', ') || 'No tasks scheduled';

      const eventsContext = events
        .slice(0, 5)
        .map(e => e.title)
        .join(', ') || 'No events today';

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const result = await langChainAPI.getDailyBrief({
        tasks: tasksContext,
        events: eventsContext,
        user_timezone: userTimezone,
      });

      setBrief(result.brief);
    } catch (error) {
      console.error('Error generating daily brief:', error);
      setBrief('Good morning! Start your day with your highest priority tasks and stay focused.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate brief on mount
    if (tasks.length > 0 || events.length > 0) {
      generateBrief();
    }
  }, []); // Only run once on mount

  if (!brief && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Sunrise className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">
            Get your personalized daily brief
          </p>
          <Button onClick={generateBrief} variant="outline" size="sm">
            <Sunrise className="h-4 w-4 mr-2" />
            Generate Daily Brief
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sunrise className="h-5 w-5 text-primary" />
            Your Daily Brief
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateBrief}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {brief}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
