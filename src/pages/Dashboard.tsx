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
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting()}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <AddEventDialog onAdd={addEvent} />
          <AddTaskDialog onAdd={addTask} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle={`${completedTasks} completed`}
          icon={CheckSquare}
        />
        <StatsCard
          title="High Priority"
          value={highPriorityTasks}
          subtitle="Needs attention"
          icon={TrendingUp}
        />
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents}
          subtitle="This week"
          icon={Calendar}
        />
        <StatsCard
          title="AI Insights"
          value={recommendations.length}
          subtitle="Active suggestions"
          icon={Sparkles}
        />
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Recommendations</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onDismiss={dismissRecommendation}
                onApply={applyRecommendation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
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
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No tasks yet</p>
              <p className="text-sm mt-1">Add your first task to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tasks.slice(0, 10).map((task, index) => (
                <div 
                  key={task.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
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
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm mt-1">Schedule your first event</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {events.slice(0, 10).map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
