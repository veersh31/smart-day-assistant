import { useEffect } from 'react';
import { format } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { useEvents } from '@/hooks/useEvents';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { EventCard } from '@/components/dashboard/EventCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { EnhancedStatsCard } from '@/components/dashboard/EnhancedStatsCard';
import { AddTaskDialog } from '@/components/dashboard/AddTaskDialog';
import { AddEventDialog } from '@/components/dashboard/AddEventDialog';
import {
  CheckSquare,
  Calendar,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTaskStatus, deleteTask } = useTasks();
  const { events, loading: eventsLoading, addEvent, updateEventCategory, deleteEvent } = useEvents();
  const {
    recommendations,
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

  // Enhanced statistics calculations
  const allTasks = tasks || [];
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  // Count all non-completed tasks as pending (including null status)
  const pendingTasks = allTasks.filter(t =>
    !t.status || t.status === 'pending' || t.status === 'in_progress'
  ).length;
  const highPriorityTasks = allTasks.filter(t =>
    t.priority_level === 'high' && t.status !== 'completed' && t.status !== 'cancelled'
  ).length;
  const upcomingEvents = events.length;
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  console.log('Dashboard Stats Debug:', {
    totalTasks: allTasks.length,
    completed: completedTasks,
    pending: pendingTasks,
    highPriority: highPriorityTasks,
    completionRate: completionRate,
    taskStatuses: allTasks.map(t => ({ title: t.title, status: t.status, priority: t.priority_level }))
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div className="animate-fade-in space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="text-gradient">
                {greeting()}{firstName ? `, ${firstName}` : ''}
              </span>
              <span className="ml-3 inline-block animate-bounce-subtle">👋</span>
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p className="text-sm font-medium">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <AddEventDialog onAdd={addEvent} />
            <AddTaskDialog onAdd={addTask} />
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            {tasksLoading ? (
              <Skeleton className="h-36 w-full rounded-2xl" />
            ) : (
              <EnhancedStatsCard
                title="Pending Tasks"
                value={pendingTasks || 0}
                subtitle={allTasks.length > 0 ? `${allTasks.length} total • ${completedTasks} done` : 'No tasks yet'}
                icon={CheckSquare}
                variant="primary"
              />
            )}
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <EnhancedStatsCard
              title="Completion Rate"
              value={`${completionRate}%`}
              subtitle={allTasks.length > 0 ? `${completedTasks}/${allTasks.length} tasks done` : 'No tasks yet'}
              icon={Target}
              variant={completionRate >= 70 ? 'success' : 'primary'}
              trend={completedTasks > 0 ? {
                value: `+${completedTasks} done`,
                direction: 'up'
              } : undefined}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <EnhancedStatsCard
              title="High Priority"
              value={highPriorityTasks || 0}
              subtitle={highPriorityTasks > 0 ? 'Needs attention' : 'All clear!'}
              icon={Zap}
              variant={highPriorityTasks > 0 ? 'warning' : 'success'}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <EnhancedStatsCard
              title="Upcoming Events"
              value={upcomingEvents || 0}
              subtitle={upcomingEvents > 0 ? 'Scheduled events' : 'No events scheduled'}
              icon={Calendar}
              variant="accent"
            />
          </div>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 shadow-glow">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">AI Recommendations</h2>
                  <p className="text-sm text-muted-foreground">Personalized productivity insights</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, i) => (
                <div
                  key={rec.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${400 + i * 50}ms` }}
                >
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
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Tasks Section */}
          <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Priority Tasks</h2>
                  <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
                </div>
              </div>
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
          <div className="animate-fade-in" style={{ animationDelay: '550ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Upcoming Events</h2>
                  <p className="text-sm text-muted-foreground">{events.length} scheduled</p>
                </div>
              </div>
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
                    onCategoryChange={updateEventCategory}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
