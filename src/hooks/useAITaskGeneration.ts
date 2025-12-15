import { useState } from 'react';
import { langChainAPI, type PrepTask } from '@/lib/langchain-api';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAITaskGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generatePrepTasks = async (events: any[], existingTasks: any[]) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to generate tasks',
        variant: 'destructive',
      });
      return null;
    }

    setIsGenerating(true);

    try {
      // Filter events for next 7 days
      const now = new Date();
      const sevenDaysLater = new Date(now);
      sevenDaysLater.setDate(now.getDate() + 7);

      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= now && eventDate <= sevenDaysLater;
      });

      if (upcomingEvents.length === 0) {
        toast({
          title: 'No upcoming events',
          description: 'You have no events in the next 7 days to analyze',
        });
        setIsGenerating(false);
        return null;
      }

      // Call AI API
      const response = await langChainAPI.generatePrepTasks({
        events: upcomingEvents,
        existing_tasks: existingTasks,
        current_date: now.toISOString(),
      });

      // Insert generated tasks into database
      if (response.generated_tasks.length > 0) {
        const tasksToInsert = response.generated_tasks.map((task: PrepTask) => ({
          user_id: user.id,
          title: task.task_title,
          description: `${task.task_description}\n\n🎯 Event: ${task.event_title}\n💡 Why: ${task.reasoning}`,
          due_date: task.due_date,
          priority_score: task.priority_score,
          priority_level: task.priority_level,
          category: task.suggested_category,
          status: 'pending',
          ai_summary: `Prep task for: ${task.event_title}`,
        }));

        const { error } = await supabase.from('tasks').insert(tasksToInsert);

        if (error) throw error;

        toast({
          title: '✨ AI Tasks Generated',
          description: `Created ${response.generated_tasks.length} prep task${response.generated_tasks.length > 1 ? 's' : ''} for upcoming events`,
        });

        return response;
      } else {
        const duplicateCount = response.duplicates_found.length;
        toast({
          title: 'No new prep tasks needed',
          description: duplicateCount > 0
            ? `${duplicateCount} similar task${duplicateCount > 1 ? 's' : ''} already exist`
            : 'Your upcoming events don\'t require additional preparation tasks',
        });
        return response;
      }
    } catch (error: any) {
      console.error('Error generating prep tasks:', error);
      toast({
        title: 'Error generating tasks',
        description: error.message || 'Failed to generate AI tasks',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePrepTasks,
    isGenerating,
  };
}
