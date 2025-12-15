import { useEffect } from 'react';
import { format } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { useEvents } from '@/hooks/useEvents';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { EventCard } from '@/components/dashboard/EventCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AddTaskDialog } from '@/components/dashboard/AddTaskDialog';
import { AddEventDialog } from '@/components/dashboard/AddEventDialog';
import { 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTaskStatus, deleteTask } = useTasks();
  const { events, loading: eventsLoading, addEvent, deleteEvent } = useEvents();
  const { 
    recommendations, 
    loading: recsLoading, 
    generateRecommendations,
    dismissRecommendation,
    applyRecommendation 
  } = useRecommendations();

  // Generate recommendations when data changes
  useEffect(() => {
    if (tasks.length > 0 || events.length > 0) {
      const timeout = setTimeout(() => {
        if (recommendations.length === 0) {
          generateRecommendations(tasks, events);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [tasks.length, events.length]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const highPriorityTasks = tasks.filter(t => t.priority_level === 'high' && t.status !== 'completed').length;
  const upcomingEvents = events.length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0];

  return (
    <div className="min-h-screen p-6 lg:p-8 bg-gradient-subtle">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting()}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <AddEventDialog onAdd={addEvent} />
          <AddTaskDialog onAdd={addTask} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks}
            subtitle={`${completedTasks} completed`}
            icon={CheckSquare}
            variant="primary"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <StatsCard
            title="Completion Rate"
            value={`${completionRate}%`}
            subtitle="Keep it up!"
            icon={Target}
            variant="success"
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="High Priority"
            value={highPriorityTasks}
            subtitle="Needs attention"
            icon={Zap}
            variant={highPriorityTasks > 0 ? 'warning' : 'default'}
          />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <StatsCard
            title="Upcoming Events"
            value={upcomingEvents}
            subtitle="This week"
            icon={Calendar}
            variant="accent"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">AI Recommendations</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, i) => (
              <div key={rec.id} style={{ animationDelay: `${250 + i * 50}ms` }}>
                <RecommendationCard
                  recommendation={rec}
                  onDismiss={dismissRecommendation}
                  onApply={applyRecommendation}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <CheckSquare className="h-4 w-4 text-primary" />
              </div>
              Priority Tasks
            </h2>
          </div>
          
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card/50 backdrop-blur-sm">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Add your first task to get AI-powered prioritization</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tasks.slice(0, 10).map((task, index) => (
                <div 
                  key={task.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${350 + index * 40}ms` }}
                >
                  <TaskCard
                    task={task}
                    onStatusChange={updateTaskStatus}
                    onDelete={deleteTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              Upcoming Events
            </h2>
          </div>
          
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-card/50 backdrop-blur-sm">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No upcoming events</p>
              <p className="text-sm mt-1">Schedule your first event to get AI insights</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {events.slice(0, 10).map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${400 + index * 40}ms` }}
                >
                  <EventCard
                    event={event}
                    onDelete={deleteEvent}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
