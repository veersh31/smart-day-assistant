import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  priority_score: number | null;
  ai_summary: string | null;
  suggested_reply: string | null;
  is_recurring: boolean | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error loading events',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Event change:', payload);
          if (payload.eventType === 'INSERT') {
            setEvents((prev) => [...prev, payload.new as CalendarEvent].sort(
              (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setEvents((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as CalendarEvent) : e))
            );
          } else if (payload.eventType === 'DELETE') {
            setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addEvent = async (eventData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
  }) => {
    if (!user) return;

    try {
      // Get AI insights
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-prioritize', {
        body: {
          type: 'event',
          title: eventData.title,
          description: eventData.description,
          context: `${eventData.start_time} to ${eventData.end_time}`,
        },
      });

      if (aiError) {
        console.error('AI analysis error:', aiError);
      }

      const { error } = await supabase.from('calendar_events').insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description || null,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location || null,
        priority_score: aiData?.priority_score || 50,
        ai_summary: aiData?.ai_summary || null,
        suggested_reply: aiData?.suggested_reply || null,
      });

      if (error) throw error;

      toast({
        title: 'Event created',
        description: aiData?.ai_summary || 'Your event has been scheduled.',
      });
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast({
        title: 'Error creating event',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const importEvents = async (eventsData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
  }[]) => {
    if (!user) return;

    try {
      const eventsToInsert = eventsData.map(event => ({
        user_id: user.id,
        title: event.title,
        description: event.description || null,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || null,
        priority_score: 50,
      }));

      const { error } = await supabase.from('calendar_events').insert(eventsToInsert);

      if (error) throw error;

      toast({
        title: 'Events imported',
        description: `Successfully imported ${eventsData.length} events.`,
      });
    } catch (error: any) {
      console.error('Error importing events:', error);
      toast({
        title: 'Error importing events',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateEventCategory = async (id: string, category: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ category: category || null })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Category updated',
        description: category ? `Event categorized as ${category}` : 'Category removed',
      });
    } catch (error: any) {
      console.error('Error updating event category:', error);
      toast({
        title: 'Error updating category',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Event deleted',
        description: 'The event has been removed.',
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error deleting event',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    events,
    loading,
    addEvent,
    importEvents,
    updateEventCategory,
    deleteEvent,
    refetch: fetchEvents,
  };
}
