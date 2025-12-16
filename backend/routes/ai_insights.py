from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from datetime import datetime
import os

router = APIRouter()

# Initialize Groq LLM
def get_llm():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=2000,
    )

# Pydantic Models for Request/Response

class TaskPrioritizeRequest(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None

class TaskPrioritizeResponse(BaseModel):
    priority_score: int = Field(ge=0, le=100, description="Priority score from 0-100")
    priority_level: Literal["low", "medium", "high"] = Field(description="Priority level")
    ai_summary: str = Field(description="1-2 sentence actionable insight")
    suggested_category: Literal["Work", "Personal", "Health", "Finance", "Learning", "Errands", "Creative", "Social"]

class EventAnalyzeRequest(BaseModel):
    title: str
    description: Optional[str] = None
    context: Optional[str] = None

class EventAnalyzeResponse(BaseModel):
    priority_score: int = Field(ge=0, le=100, description="Event priority score")
    ai_summary: str = Field(description="Preparation tip or meeting insight")
    suggested_reply: Optional[str] = Field(default=None, description="Professional reply for meeting invites")

class Recommendation(BaseModel):
    type: Literal["reschedule", "delegation", "priority", "time_block", "batch", "break"]
    title: str
    description: str

class RecommendationsRequest(BaseModel):
    tasks: Optional[str] = None
    events: Optional[str] = None

class DailyBriefRequest(BaseModel):
    tasks: Optional[str] = None
    events: Optional[str] = None
    user_timezone: Optional[str] = "UTC"

class PrepTask(BaseModel):
    event_id: str
    event_title: str
    task_title: str
    task_description: str
    priority_score: int = Field(ge=0, le=100)
    priority_level: Literal["low", "medium", "high"]
    suggested_category: Literal["Work", "Personal", "Health", "Finance", "Learning", "Errands", "Creative", "Social"]
    due_date: str
    reasoning: str
    is_duplicate: bool
    similar_task_id: Optional[str] = None

class PrepTasksResponse(BaseModel):
    prep_tasks: List[PrepTask]

class Event(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start_time: str
    category: Optional[str] = None

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None

class PrepTasksRequest(BaseModel):
    events: List[Event]
    existing_tasks: List[Task]
    current_date: str

# Task Prioritization Endpoint
@router.post("/prioritize-task", response_model=TaskPrioritizeResponse)
async def prioritize_task(request: TaskPrioritizeRequest):
    try:
        parser = PydanticOutputParser(pydantic_object=TaskPrioritizeResponse)

        prompt = PromptTemplate.from_template("""
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
""")

        input_data = prompt.format(
            title=request.title or "Untitled Task",
            description=request.description or "No description provided",
            due_date=request.due_date or "No deadline set",
            current_date=datetime.now().isoformat(),
            format_instructions=parser.get_format_instructions(),
        )

        llm = get_llm()
        response = await llm.ainvoke(input_data)
        parsed = parser.parse(response.content)

        return parsed
    except Exception as e:
        print(f"Error in task prioritization: {e}")
        # Return fallback
        return TaskPrioritizeResponse(
            priority_score=50,
            priority_level="medium",
            ai_summary="Added to your task list. Consider setting a deadline for better prioritization.",
            suggested_category="Work"
        )

# Event Analysis Endpoint
@router.post("/analyze-event", response_model=EventAnalyzeResponse)
async def analyze_event(request: EventAnalyzeRequest):
    try:
        parser = PydanticOutputParser(pydantic_object=EventAnalyzeResponse)

        prompt = PromptTemplate.from_template("""
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
""")

        input_data = prompt.format(
            title=request.title or "Untitled Event",
            description=request.description or "No description provided",
            context=request.context or "Time not specified",
            current_date=datetime.now().isoformat(),
            format_instructions=parser.get_format_instructions(),
        )

        llm = get_llm()
        response = await llm.ainvoke(input_data)
        parsed = parser.parse(response.content)

        return parsed
    except Exception as e:
        print(f"Error in event analysis: {e}")
        return EventAnalyzeResponse(
            priority_score=60,
            ai_summary="Event scheduled. Review your calendar for potential conflicts.",
            suggested_reply=None
        )

# Generate AI Recommendations Endpoint
@router.post("/generate-recommendations", response_model=List[Recommendation])
async def generate_recommendations(request: RecommendationsRequest):
    try:
        class RecommendationsResponse(BaseModel):
            recommendations: List[Recommendation]

        parser = PydanticOutputParser(pydantic_object=RecommendationsResponse)

        prompt = PromptTemplate.from_template("""
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
""")

        input_data = prompt.format(
            tasks=request.tasks or "No active tasks",
            events=request.events or "No upcoming events",
            current_date=datetime.now().isoformat(),
            format_instructions=parser.get_format_instructions(),
        )

        llm = get_llm()
        response = await llm.ainvoke(input_data)
        parsed = parser.parse(response.content)

        return parsed.recommendations
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return [
            Recommendation(
                type="priority",
                title="Review your task priorities",
                description="Take 5 minutes to review your current tasks and ensure the most important ones are at the top of your list. Focus on impact over urgency."
            ),
            Recommendation(
                type="time_block",
                title="Schedule a focus block",
                description="Block out 2 hours tomorrow morning for deep work on your highest priority task. Turn off notifications and close unnecessary tabs."
            )
        ]

# Smart Daily Brief Endpoint
@router.post("/daily-brief")
async def daily_brief(request: DailyBriefRequest):
    try:
        prompt = PromptTemplate.from_template("""
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
""")

        input_data = prompt.format(
            tasks=request.tasks or "No tasks scheduled",
            events=request.events or "No events today",
            timezone=request.user_timezone,
            current_time=datetime.now().isoformat(),
        )

        llm = get_llm()
        response = await llm.ainvoke(input_data)

        return {"brief": response.content}
    except Exception as e:
        print(f"Error generating daily brief: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate Prep Tasks Endpoint
@router.post("/generate-prep-tasks")
async def generate_prep_tasks(request: PrepTasksRequest):
    try:
        parser = PydanticOutputParser(pydantic_object=PrepTasksResponse)

        # Format events for AI consumption
        events_context = []
        for event in request.events:
            start_time = datetime.fromisoformat(event.start_time.replace('Z', '+00:00'))
            current_time = datetime.fromisoformat(request.current_date.replace('Z', '+00:00'))
            days_until = (start_time - current_time).days

            event_str = f'- "{event.title}" ({event.category or "Uncategorized"}) on {event.start_time} ({days_until} days away)'
            if event.description:
                event_str += f': {event.description}'
            events_context.append(event_str)

        events_text = '\n'.join(events_context)

        # Format existing tasks
        tasks_context = []
        for task in request.existing_tasks:
            task_str = f'- "{task.title}"'
            if task.description:
                task_str += f': {task.description}'
            task_str += f' (due: {task.due_date or "no deadline"})'
            tasks_context.append(task_str)

        tasks_text = '\n'.join(tasks_context) if tasks_context else "No existing tasks"

        prompt = PromptTemplate.from_template("""
You are an expert personal assistant specializing in event preparation and productivity planning.

TASK: Analyze upcoming calendar events and generate specific preparatory tasks that will help the user be ready for each event.

UPCOMING EVENTS (Next 7 Days):
{events}

EXISTING TASKS (For Deduplication):
{existing_tasks}

CURRENT DATE: {current_date}

INSTRUCTIONS:

1. EVENT ANALYSIS: For each event, determine if it requires preparation tasks
   - REQUIRE PREP: Interviews, presentations, important meetings, exams, deadlines, client calls, workshops, doctor appointments
   - SKIP: Lunch, casual coffee, informal catch-ups, personal time blocks, routine check-ins (unless specified as important)

2. TASK GENERATION: For events needing prep, create SPECIFIC, ACTIONABLE tasks
   Examples:
   - "Technical Interview" → "Review data structures and algorithms, practice coding problems"
   - "Client Presentation" → "Prepare PowerPoint deck with Q3 metrics and projections"
   - "Doctor Appointment" → "Write down symptoms and questions for doctor"
   - "Team Planning Meeting" → "Review last sprint's progress and prepare agenda items"

3. PRIORITY CALCULATION (Based on days until event):
   - 1-2 days away: priority_level="high" priority_score=80-100
   - 3-4 days away: priority_level="high" priority_score=60-79
   - 5-7 days away: priority_level="medium" priority_score=40-59

   IMPORTANT: priority_level MUST be exactly one of: "low", "medium", or "high" (no hyphens, no other values)

4. DUE DATE LOGIC:
   - For events 1-2 days away: Due date = 1 day before event
   - For events 3-5 days away: Due date = 2 days before event
   - For events 6-7 days away: Due date = 3 days before event

5. SMART DEDUPLICATION:
   - Check existing tasks for similar titles/descriptions
   - Consider tasks duplicate if:
     * Same event mentioned (fuzzy match on event title)
     * Similar preparation keywords (e.g., "study for interview" vs "prepare for interview")
     * Same due date window (within 1 day)
   - If duplicate found, set is_duplicate=true and provide similar_task_id

6. CATEGORY MAPPING:
   - Work events → Work
   - Medical/fitness → Health
   - Learning/courses → Learning
   - Social events → Social
   - Match event category if available

QUALITY STANDARDS:
- Task titles must be SPECIFIC and ACTIONABLE (not just "Prepare for X")
- Include WHAT to prepare in the task title
- Reasoning should explain WHY this prep is important
- Be selective - only create tasks for events that genuinely need preparation
- Aim for 1-2 prep tasks per event maximum (don't over-generate)

{format_instructions}
""")

        input_data = prompt.format(
            events=events_text,
            existing_tasks=tasks_text,
            current_date=request.current_date,
            format_instructions=parser.get_format_instructions(),
        )

        llm = get_llm()
        response = await llm.ainvoke(input_data)
        parsed = parser.parse(response.content)

        # Filter out duplicates
        new_tasks = [task for task in parsed.prep_tasks if not task.is_duplicate]
        duplicates = [task for task in parsed.prep_tasks if task.is_duplicate]

        return {
            "generated_tasks": new_tasks,
            "duplicates_found": duplicates,
            "total_events_analyzed": len(request.events),
            "tasks_created": len(new_tasks)
        }
    except Exception as e:
        print(f"Error generating prep tasks: {e}")
        return {
            "generated_tasks": [],
            "duplicates_found": [],
            "total_events_analyzed": 0,
            "tasks_created": 0
        }
