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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="heading-page">
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p className="text-sm">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddEventDialog onAdd={addEvent} />
          <AddTaskDialog onAdd={addTask} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tasksLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : (
          <EnhancedStatsCard
            title="Pending Tasks"
            value={pendingTasks || 0}
            subtitle={allTasks.length > 0 ? `${allTasks.length} total • ${completedTasks} done` : 'No tasks yet'}
            icon={CheckSquare}
            variant="primary"
          />
        )}
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
        <EnhancedStatsCard
          title="High Priority"
          value={highPriorityTasks || 0}
          subtitle={highPriorityTasks > 0 ? 'Needs attention' : 'All clear!'}
          icon={Zap}
          variant={highPriorityTasks > 0 ? 'warning' : 'success'}
        />
        <EnhancedStatsCard
          title="Upcoming Events"
          value={upcomingEvents || 0}
          subtitle={upcomingEvents > 0 ? 'Scheduled events' : 'No events scheduled'}
          icon={Calendar}
          variant="accent"
        />
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="heading-section">AI Recommendations</h2>
              <p className="text-sm text-muted-foreground">Personalized productivity insights</p>
            </div>
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
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="heading-section">Priority Tasks</h2>
              <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
            </div>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/50">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Add your first task to get AI-powered prioritization</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {tasks.slice(0, 10).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="heading-section">Upcoming Events</h2>
              <p className="text-sm text-muted-foreground">{events.length} scheduled</p>
            </div>
          </div>

          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/50">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No upcoming events</p>
              <p className="text-sm mt-1">Schedule your first event to get AI insights</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {events.slice(0, 10).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={deleteEvent}
                  onCategoryChange={updateEventCategory}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
