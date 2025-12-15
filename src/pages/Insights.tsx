import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useEvents } from '@/hooks/useEvents';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart
} from 'lucide-react';

export default function Insights() {
  const { tasks } = useTasks();
  const { events } = useEvents();
  const { 
    recommendations, 
    loading, 
    generateRecommendations,
    dismissRecommendation,
    applyRecommendation 
  } = useRecommendations();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    await generateRecommendations(tasks, events);
    setIsGenerating(false);
  };

  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityCompleted = tasks.filter(t => t.priority_level === 'high' && t.status === 'completed').length;
  const highPriorityTotal = tasks.filter(t => t.priority_level === 'high').length;
  
  const avgPriorityScore = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, t) => sum + (t.priority_score || 50), 0) / tasks.length)
    : 0;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized recommendations to boost your productivity
          </p>
        </div>
        
        <Button 
          variant="gradient" 
          onClick={handleGenerateRecommendations}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Generate Insights
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Priority Score</p>
                <p className="text-2xl font-bold">{avgPriorityScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority Done</p>
                <p className="text-2xl font-bold">{highPriorityCompleted}/{highPriorityTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <Sparkles className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Insights</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Recommendations
        </h2>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground">No active recommendations</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Generate Insights" to get personalized suggestions
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <RecommendationCard
                  recommendation={rec}
                  onDismiss={dismissRecommendation}
                  onApply={applyRecommendation}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productivity Tips */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Productivity Tips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Focus on High-Impact Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prioritize tasks with higher AI scores first. These are typically more urgent or impactful based on deadlines and descriptions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-5 w-5 text-info" />
                Time Blocking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule dedicated time blocks for focused work. Your calendar shows when you have events - use free time for deep work.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
