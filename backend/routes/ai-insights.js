import express from 'express';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const router = express.Router();

// Lazy-initialize Groq LLM to ensure environment variables are loaded
let llm = null;
function getLLM() {
  if (!llm) {
    llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile', // Fast and powerful model
      temperature: 0.7,
      maxTokens: 2000,
    });
  }
  return llm;
}

// Task Analysis Schema
const taskSchema = z.object({
  priority_score: z.number().min(0).max(100).describe('Priority score from 0-100'),
  priority_level: z.enum(['low', 'medium', 'high']).describe('Priority level'),
  ai_summary: z.string().describe('1-2 sentence actionable insight'),
  suggested_category: z.enum(['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Errands', 'Creative', 'Social']).describe('Task category'),
});

// Event Analysis Schema
const eventSchema = z.object({
  priority_score: z.number().min(0).max(100).describe('Event priority score'),
  ai_summary: z.string().describe('Preparation tip or meeting insight'),
  suggested_reply: z.string().nullable().describe('Professional reply for meeting invites'),
});

// Recommendation Schema
const recommendationSchema = z.object({
  recommendations: z.array(z.object({
    type: z.enum(['reschedule', 'delegation', 'priority', 'time_block', 'batch', 'break']).describe('Recommendation type'),
    title: z.string().describe('Short action-oriented title'),
    description: z.string().describe('Specific actionable steps'),
  })).min(2).max(5),
});

// Task Prioritization Endpoint
router.post('/prioritize-task', async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    const parser = StructuredOutputParser.fromZodSchema(taskSchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = PromptTemplate.fromTemplate(`
You are an expert productivity coach and task prioritization specialist with deep knowledge of time management frameworks like Eisenhower Matrix, GTD, and Priority Matrix.

Analyze this task comprehensively and provide intelligent prioritization:

TASK DETAILS:
- Title: {title}
- Description: {description}
- Due Date: {due_date}
- Current Date/Time: {current_date}

PRIORITIZATION CRITERIA (consider all factors):
1. URGENCY: How close is the deadline? Is it time-sensitive?
2. IMPORTANCE: How impactful is completing this task? Does it block other work?
3. EFFORT: Is this a quick win or a major undertaking?
4. CONTEXT: Work vs personal, recurring vs one-time, dependencies
5. CONSEQUENCE: What happens if this isn't done on time?

SCORING GUIDE:
- 90-100: Critical/urgent, deadline within 24h, high-impact, blocks other work
- 70-89: Important, deadline within 3 days, significant impact
- 50-69: Moderate priority, deadline within a week, meaningful work
- 30-49: Low priority, flexible deadline, nice-to-have
- 0-29: Very low priority, no deadline, minimal impact

Provide actionable insights that help the user understand WHY this task has this priority and WHAT they should do about it.

{format_instructions}
`);

    const input = await prompt.format({
      title: title || 'Untitled Task',
      description: description || 'No description provided',
      due_date: due_date || 'No deadline set',
      current_date: new Date().toISOString(),
      format_instructions: formatInstructions,
    });

    const response = await getLLM().invoke(input);
    const parsed = await parser.parse(response.content);

    res.json(parsed);
  } catch (error) {
    console.error('Error in task prioritization:', error);
    res.status(500).json({
      error: error.message,
      fallback: {
        priority_score: 50,
        priority_level: 'medium',
        ai_summary: 'Added to your task list. Consider setting a deadline for better prioritization.',
        suggested_category: 'Work',
      }
    });
  }
});

// Event Analysis Endpoint
router.post('/analyze-event', async (req, res) => {
  try {
    const { title, description, context } = req.body;

    const parser = StructuredOutputParser.fromZodSchema(eventSchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = PromptTemplate.fromTemplate(`
You are an executive assistant specializing in calendar management and meeting preparation with expertise in professional communication and time management.

Analyze this calendar event and provide intelligent insights:

EVENT DETAILS:
- Title: {title}
- Description: {description}
- Time/Context: {context}
- Current Date/Time: {current_date}

ANALYSIS CRITERIA:
1. PREPARATION NEEDED: What should they prepare beforehand? (agenda, materials, questions)
2. IMPORTANCE: Is this a key meeting, casual catch-up, or routine event?
3. RESPONSE NEEDED: Would a professional reply be appropriate?
4. TIME MANAGEMENT: Any scheduling insights or optimization opportunities?
5. MEETING TYPE: Interview, 1:1, team meeting, presentation, social, personal?

PRIORITY SCORING:
- 90-100: Critical meetings (interviews, executive presentations, client calls)
- 70-89: Important meetings (team standups, planning sessions, key 1:1s)
- 50-69: Standard meetings (routine check-ins, casual meetings)
- 30-49: Optional events (social gatherings, informal coffee chats)
- 0-29: Low priority events (optional webinars, FYI calendar blocks)

Provide preparation tips that are specific and actionable. If it's a meeting invite, suggest a professional reply.

{format_instructions}
`);

    const input = await prompt.format({
      title: title || 'Untitled Event',
      description: description || 'No description provided',
      context: context || 'Time not specified',
      current_date: new Date().toISOString(),
      format_instructions: formatInstructions,
    });

    const response = await getLLM().invoke(input);
    const parsed = await parser.parse(response.content);

    res.json(parsed);
  } catch (error) {
    console.error('Error in event analysis:', error);
    res.status(500).json({
      error: error.message,
      fallback: {
        priority_score: 60,
        ai_summary: 'Event scheduled. Review your calendar for potential conflicts.',
        suggested_reply: null,
      }
    });
  }
});

// Generate AI Recommendations Endpoint
router.post('/generate-recommendations', async (req, res) => {
  try {
    const { tasks, events } = req.body;

    const parser = StructuredOutputParser.fromZodSchema(recommendationSchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = PromptTemplate.fromTemplate(`
You are a world-class productivity coach with expertise in time management, work-life balance, and personal effectiveness. You've helped thousands of professionals optimize their schedules.

Based on the user's current workload, generate highly specific and actionable recommendations that feel personalized and valuable.

CURRENT WORKLOAD:
- Active Tasks: {tasks}
- Upcoming Events: {events}
- Current Date: {current_date}

RECOMMENDATION TYPES TO CONSIDER:
1. RESCHEDULE: Suggest moving tasks/events for better time management or energy alignment
2. DELEGATION: Identify tasks that could be delegated, automated, or eliminated
3. PRIORITY: Highlight which tasks need immediate attention and why
4. TIME_BLOCK: Suggest dedicated focus time blocks for deep work
5. BATCH: Group similar tasks together for efficiency (emails, calls, errands)
6. BREAK: Recommend breaks or self-care if overloaded (prevent burnout)

QUALITY CRITERIA:
- Be SPECIFIC: Reference actual task/event names from their list when possible
- Be ACTIONABLE: Tell them exactly what to do with clear next steps
- Be REALISTIC: Consider their actual schedule and constraints
- Add VALUE: Don't state the obvious - provide insights they wouldn't think of themselves
- Be EMPATHETIC: Acknowledge their workload and provide encouraging guidance
- PRIORITIZE IMPACT: Focus on recommendations that will make the biggest difference

BEST PRACTICES:
- Look for patterns in their tasks (are they doing too much? procrastinating on something?)
- Consider time-of-day energy (morning for deep work, afternoon for meetings)
- Balance urgency with importance (don't just focus on deadlines)
- Suggest specific time blocks based on their calendar
- If they're overloaded, be brave enough to suggest what to drop or defer

Generate 2-5 recommendations that will genuinely help them be more productive and balanced.

{format_instructions}
`);

    const input = await prompt.format({
      tasks: tasks || 'No active tasks',
      events: events || 'No upcoming events',
      current_date: new Date().toISOString(),
      format_instructions: formatInstructions,
    });

    const response = await getLLM().invoke(input);
    const parsed = await parser.parse(response.content);

    res.json(parsed.recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      error: error.message,
      fallback: [
        {
          type: 'priority',
          title: 'Review your task priorities',
          description: 'Take 5 minutes to review your current tasks and ensure the most important ones are at the top of your list. Focus on impact over urgency.',
        },
        {
          type: 'time_block',
          title: 'Schedule a focus block',
          description: 'Block out 2 hours tomorrow morning for deep work on your highest priority task. Turn off notifications and close unnecessary tabs.',
        }
      ]
    });
  }
});

// Smart Daily Brief Endpoint (New Feature!)
router.post('/daily-brief', async (req, res) => {
  try {
    const { tasks, events, user_timezone } = req.body;

    const prompt = PromptTemplate.fromTemplate(`
You are a personal productivity assistant creating a morning brief for your user.

TODAY'S SCHEDULE:
Tasks: {tasks}
Events: {events}
Timezone: {timezone}
Current Time: {current_time}

Create a concise, motivating daily brief that includes:
1. Key priorities for today (top 3 tasks)
2. Time management tips based on their schedule
3. One motivational insight or productivity tip
4. Weather check reminder if they have outdoor events

Keep it under 200 words, conversational, and encouraging.
`);

    const input = await prompt.format({
      tasks: tasks || 'No tasks scheduled',
      events: events || 'No events today',
      timezone: user_timezone || 'UTC',
      current_time: new Date().toLocaleString(),
    });

    const response = await getLLM().invoke(input);

    res.json({ brief: response.content });
  } catch (error) {
    console.error('Error generating daily brief:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
