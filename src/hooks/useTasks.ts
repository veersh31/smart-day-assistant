import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority_score: number | null;
  priority_level: string | null;
  status: string | null;
  ai_summary: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority_score', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Task change:', payload);
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTask = async (taskData: {
    title: string;
    description: string;
    due_date: string | null;
    priority_level: string;
    category: string;
  }) => {
    if (!user) return;

    try {
      // First, get AI prioritization
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-prioritize', {
        body: {
          type: 'task',
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
        },
      });

      if (aiError) {
        console.error('AI prioritization error:', aiError);
      }

      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.due_date,
        priority_level: aiData?.priority_level || taskData.priority_level,
        priority_score: aiData?.priority_score || 50,
        ai_summary: aiData?.ai_summary || null,
        category: taskData.category,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Task created',
        description: aiData?.ai_summary || 'Your task has been added.',
      });
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTaskStatus,
    deleteTask,
    refetch: fetchTasks,
  };
}
