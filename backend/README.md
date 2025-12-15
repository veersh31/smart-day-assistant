# Smart Day Assistant - LangChain Backend

This is the LangChain-powered AI backend for the Smart Day Assistant application.

## Features

- **Task Prioritization**: AI-powered task analysis using LangChain and Groq's LLaMA 3.3 70B model
- **Event Analysis**: Smart calendar event insights and meeting preparation tips
- **AI Recommendations**: Personalized productivity recommendations based on workload
- **Daily Brief**: Morning briefing with priorities and productivity tips

## Tech Stack

- **LangChain**: Framework for building LLM applications
- **Groq**: Ultra-fast LLM inference with LLaMA 3.3 70B Versatile
- **Express.js**: Web server framework
- **Zod**: Schema validation and structured output parsing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables are loaded from the parent `.env` file:**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

   Or with auto-reload during development:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Task Prioritization
```
POST /api/ai/prioritize-task
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Write and submit Q1 project proposal",
  "due_date": "2025-12-20"
}
```

### Event Analysis
```
POST /api/ai/analyze-event
Content-Type: application/json

{
  "title": "Team Standup",
  "description": "Daily team sync",
  "context": "9:00 AM - 9:15 AM"
}
```

### Generate Recommendations
```
POST /api/ai/generate-recommendations
Content-Type: application/json

{
  "tasks": "Complete report (high), Review PRs (medium)",
  "events": "Team meeting at 10 AM, Client call at 2 PM"
}
```

### Daily Brief
```
POST /api/ai/daily-brief
Content-Type: application/json

{
  "tasks": "Complete report (high), Review PRs (medium)",
  "events": "Team meeting at 10 AM",
  "user_timezone": "America/New_York"
}
```

## Running from Root Directory

From the project root, you can run:

```bash
# Start the backend
npm run backend

# Start with auto-reload (development)
npm run backend:dev
```

## Model Information

This backend uses **Groq's LLaMA 3.3 70B Versatile** model, which provides:
- Ultra-fast inference (500+ tokens/second)
- High-quality reasoning and analysis
- Cost-effective AI operations
- Structured output support

## Error Handling

All endpoints include fallback responses in case of AI service failures, ensuring the application remains functional even during API downtime.
