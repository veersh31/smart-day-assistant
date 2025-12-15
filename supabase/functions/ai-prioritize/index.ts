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
    
    if (type === "task") {
      prompt = `You are a productivity assistant. Analyze this task and provide a JSON response.

Task: "${title}"
${description ? `Description: "${description}"` : ""}
${due_date ? `Due date: ${due_date}` : "No due date set"}
${context ? `Additional context: ${context}` : ""}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "priority_score": <number 0-100, higher = more urgent/important>,
  "priority_level": "<'low' | 'medium' | 'high'>",
  "ai_summary": "<brief 1-2 sentence actionable insight or recommendation>"
}`;
    } else if (type === "event") {
      prompt = `You are a scheduling assistant. Analyze this calendar event and provide a JSON response.

Event: "${title}"
${description ? `Description: "${description}"` : ""}
${context ? `Time: ${context}` : ""}

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "priority_score": <number 0-100, higher = more important>,
  "ai_summary": "<brief insight about this meeting's importance or preparation tips>",
  "suggested_reply": "<a polite, professional response to confirm attendance or ask for agenda, if applicable, otherwise null>"
}`;
    } else if (type === "recommendation") {
      prompt = `You are a productivity coach. Based on the user's tasks and schedule, generate helpful recommendations.

Current tasks: ${context?.tasks || "No tasks"}
Upcoming events: ${context?.events || "No events"}

Respond with ONLY a valid JSON array of 1-3 recommendations (no markdown, no explanation):
[
  {
    "type": "<'reschedule' | 'delegation' | 'priority' | 'time_block'>",
    "title": "<short actionable title>",
    "description": "<helpful explanation of why and how to implement this>"
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
          { role: "system", content: "You are a helpful productivity AI assistant. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
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
      // Return default values if parsing fails
      if (type === "task") {
        result = { priority_score: 50, priority_level: "medium", ai_summary: "Task added successfully." };
      } else if (type === "event") {
        result = { priority_score: 50, ai_summary: "Event scheduled.", suggested_reply: null };
      } else {
        result = [];
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
