import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/dashboard/EventCard';
import { AddEventDialog } from '@/components/dashboard/AddEventDialog';
import { ImportICSDialog } from '@/components/dashboard/ImportICSDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  List,
  Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { events, loading, addEvent, importEvents, deleteEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsForDate = (date: Date) => 
    events.filter((event) => isSameDay(new Date(event.start_time), date));

  const selectedDateEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            {events.length} upcoming events
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <ImportICSDialog onImport={importEvents} />
          <AddEventDialog onAdd={addEvent} />
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {days.map((day) => {
                  const dayEvents = eventsForDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "aspect-square rounded-lg p-1 text-sm transition-all hover:bg-secondary",
                        isToday(day) && "bg-primary/10 font-bold",
                        isSelected && "ring-2 ring-primary bg-primary/5",
                      )}
                    >
                      <div className="text-foreground">{format(day, 'd')}</div>
                      {dayEvents.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No upcoming events</p>
              <p className="text-sm mt-1">Schedule your first event</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <EventCard event={event} onDelete={deleteEvent} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
