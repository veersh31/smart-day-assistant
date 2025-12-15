import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Recommendation {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  related_task_id: string | null;
  related_event_id: string | null;
  is_dismissed: boolean | null;
  is_applied: boolean | null;
  created_at: string;
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .eq('is_applied', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('recommendations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_recommendations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Recommendation change:', payload);
          fetchRecommendations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRecommendations]);

  const generateRecommendations = async (tasks: any[], events: any[]) => {
    if (!user) return;

    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-prioritize', {
        body: {
          type: 'recommendation',
          context: {
            tasks: tasks.slice(0, 5).map(t => `${t.title} (${t.priority_level})`).join(', '),
            events: events.slice(0, 5).map(e => e.title).join(', '),
          },
        },
      });

      if (aiError) throw aiError;

      if (Array.isArray(aiData) && aiData.length > 0) {
        for (const rec of aiData) {
          await supabase.from('ai_recommendations').insert({
            user_id: user.id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
          });
        }
      }
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_dismissed: true })
        .eq('id', id);

      if (error) throw error;
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const applyRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_applied: true })
        .eq('id', id);

      if (error) throw error;
      setRecommendations((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: 'Recommendation applied',
        description: 'Great choice! Keep up the productivity.',
      });
    } catch (error: any) {
      console.error('Error applying recommendation:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    recommendations,
    loading,
    generateRecommendations,
    dismissRecommendation,
    applyRecommendation,
    refetch: fetchRecommendations,
  };
}
