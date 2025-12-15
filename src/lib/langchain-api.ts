/**
 * LangChain API Client
 * Handles all communication with the LangChain-powered AI backend
 */

const API_BASE_URL = import.meta.env.VITE_LANGCHAIN_API_ENDPOINT || 'http://localhost:3001';

interface TaskPrioritizationRequest {
  title: string;
  description?: string;
  due_date?: string;
}

interface TaskPrioritizationResponse {
  priority_score: number;
  priority_level: 'low' | 'medium' | 'high';
  ai_summary: string;
  suggested_category: string;
}

interface EventAnalysisRequest {
  title: string;
  description?: string;
  context?: string;
}

interface EventAnalysisResponse {
  priority_score: number;
  ai_summary: string;
  suggested_reply: string | null;
}

interface RecommendationRequest {
  tasks: string;
  events: string;
}

interface Recommendation {
  type: 'reschedule' | 'delegation' | 'priority' | 'time_block' | 'batch' | 'break';
  title: string;
  description: string;
}

interface DailyBriefRequest {
  tasks: string;
  events: string;
  user_timezone?: string;
}

interface DailyBriefResponse {
  brief: string;
}

class LangChainAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async prioritizeTask(data: TaskPrioritizationRequest): Promise<TaskPrioritizationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/prioritize-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          console.warn('Using fallback data for task prioritization');
          return errorData.fallback;
        }
        throw new Error(`Failed to prioritize task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in prioritizeTask:', error);
      // Return sensible defaults
      return {
        priority_score: 50,
        priority_level: 'medium',
        ai_summary: 'Task added. Set a deadline for better prioritization.',
        suggested_category: 'Work',
      };
    }
  }

  async analyzeEvent(data: EventAnalysisRequest): Promise<EventAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/analyze-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          console.warn('Using fallback data for event analysis');
          return errorData.fallback;
        }
        throw new Error(`Failed to analyze event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in analyzeEvent:', error);
      return {
        priority_score: 60,
        ai_summary: 'Event scheduled. Review your calendar for conflicts.',
        suggested_reply: null,
      };
    }
  }

  async generateRecommendations(data: RecommendationRequest): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          console.warn('Using fallback recommendations');
          return errorData.fallback;
        }
        throw new Error(`Failed to generate recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateRecommendations:', error);
      return [
        {
          type: 'priority',
          title: 'Review your priorities',
          description: 'Take a moment to review and prioritize your tasks for maximum impact.',
        },
      ];
    }
  }

  async getDailyBrief(data: DailyBriefRequest): Promise<DailyBriefResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/daily-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to get daily brief: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getDailyBrief:', error);
      return {
        brief: 'Good morning! Focus on your top priorities today and take breaks when needed.',
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('LangChain API health check failed:', error);
      return false;
    }
  }
}

export const langChainAPI = new LangChainAPI();
export type { TaskPrioritizationResponse, EventAnalysisResponse, Recommendation };
