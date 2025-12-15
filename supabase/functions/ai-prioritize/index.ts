import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, title, description, due_date, context } = await req.json();
    console.log("Processing request:", { type, title });

    let prompt = "";
    const currentDate = new Date().toISOString();
    
    if (type === "task") {
      prompt = `You are an expert productivity coach and task prioritization specialist. Analyze this task comprehensively and provide intelligent prioritization.

TASK DETAILS:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Due Date: ${due_date || 'No deadline set'}
- Current Date/Time: ${currentDate}

PRIORITIZATION CRITERIA (consider all factors):
1. URGENCY: How close is the deadline? Is it time-sensitive?
2. IMPORTANCE: How impactful is completing this task? Does it block other work?
3. EFFORT: Is this a quick win or a major undertaking?
4. CONTEXT: Work vs personal, recurring vs one-time, dependencies

SCORING GUIDE:
- 90-100: Critical/urgent, deadline within 24h, high-impact
- 70-89: Important, deadline within 3 days, significant impact
- 50-69: Moderate priority, deadline within a week
- 30-49: Low priority, flexible deadline, nice-to-have
- 0-29: Very low priority, no deadline, minimal impact

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "priority_score": <number 0-100>,
  "priority_level": "<'low' | 'medium' | 'high'>",
  "ai_summary": "<1-2 sentence actionable insight: what to do, why it matters, or a productivity tip>",
  "suggested_category": "<'Work' | 'Personal' | 'Health' | 'Finance' | 'Learning' | 'Errands' | 'Creative' | 'Social'>"
}`;
    } else if (type === "event") {
      prompt = `You are an executive assistant specializing in calendar management and meeting preparation. Analyze this calendar event and provide intelligent insights.

EVENT DETAILS:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Time: ${context || 'Time not specified'}
- Current Date/Time: ${currentDate}

ANALYSIS CRITERIA:
1. PREPARATION NEEDED: What should they prepare beforehand?
2. IMPORTANCE: Is this a key meeting, casual catch-up, or routine event?
3. RESPONSE NEEDED: Would a professional reply be appropriate?
4. TIME MANAGEMENT: Any scheduling conflicts or optimization opportunities?

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "priority_score": <number 0-100, 80+ for important meetings, 50-79 for standard, below 50 for optional>,
  "ai_summary": "<1-2 sentence preparation tip or insight about this meeting>",
  "suggested_reply": "<A polite, professional response for meeting invites - keep it concise and actionable. Return null if not a meeting invite or no reply needed>"
}`;
    } else if (type === "recommendation") {
      prompt = `You are a world-class productivity coach. Based on the user's current workload, generate highly specific and actionable recommendations.

CURRENT WORKLOAD:
- Active Tasks: ${context?.tasks || "No tasks"}
- Upcoming Events: ${context?.events || "No events"}
- Current Date: ${currentDate}

RECOMMENDATION TYPES TO CONSIDER:
1. RESCHEDULE: Suggest moving tasks/events for better time management
2. DELEGATION: Identify tasks that could be delegated or automated
3. PRIORITY: Highlight which tasks need immediate attention
4. TIME_BLOCK: Suggest dedicated focus time blocks
5. BATCH: Group similar tasks together for efficiency
6. BREAK: Recommend breaks or self-care if overloaded

QUALITY CRITERIA:
- Be specific (reference actual task/event names when possible)
- Be actionable (tell them exactly what to do)
- Be realistic (consider their actual schedule)
- Add value (don't state the obvious)

Respond with ONLY a valid JSON array of 2-4 recommendations (no markdown, no explanation):
[
  {
    "type": "<'reschedule' | 'delegation' | 'priority' | 'time_block'>",
    "title": "<short, action-oriented title - max 8 words>",
    "description": "<specific explanation with actionable next steps - 2-3 sentences max>"
  }
]`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert productivity AI. Always respond with valid JSON only. Be specific, actionable, and insightful. Your recommendations should feel personalized and valuable, not generic." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log("AI response:", content);

    // Parse the JSON response
    let result;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return intelligent defaults if parsing fails
      if (type === "task") {
        result = { 
          priority_score: 50, 
          priority_level: "medium", 
          ai_summary: "Added to your task list. Consider setting a deadline for better prioritization.",
          suggested_category: "Work"
        };
      } else if (type === "event") {
        result = { 
          priority_score: 60, 
          ai_summary: "Event scheduled. Review your calendar for potential conflicts.", 
          suggested_reply: null 
        };
      } else {
        result = [
          {
            type: "priority",
            title: "Review your task priorities",
            description: "Take 5 minutes to review your current tasks and ensure the most important ones are at the top of your list."
          }
        ];
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-prioritize function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
