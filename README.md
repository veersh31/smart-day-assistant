# 📅 Smart Day Assistant

An AI-powered productivity app that helps you manage tasks and events with intelligent prioritization and recommendations.

![Smart Day Assistant](https://img.shields.io/badge/Built%20with-React%20%2B%20TypeScript-blue)
![AI Powered](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-green)
![Database](https://img.shields.io/badge/Database-Supabase-brightgreen)

## ✨ Features

- 🤖 **AI-Powered Task Prioritization** - Automatically prioritizes tasks based on deadlines, importance, and context
- 📊 **Smart Analytics** - Visual insights into your productivity and task completion rates
- 📅 **Calendar Integration** - Import `.ics` files and sync with your calendar
- ✅ **Intelligent Task Generation** - AI creates prep tasks for upcoming events
- 🎯 **Personalized Recommendations** - Get AI-driven productivity tips tailored to your workload
- 🌓 **Dark Mode** - Beautiful, clean UI with dark mode support
- 🔐 **Secure Authentication** - Powered by Supabase Auth

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** + **shadcn/ui** for modern, accessible components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Supabase** for authentication and database

### Backend
- **Node.js** + **Express**
- **LangChain** for AI integration
- **Groq LLaMA 3.3 70B** for natural language processing
- **Zod** for schema validation

### Database
- **Supabase (PostgreSQL)** with Row Level Security

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-day-assistant.git
   cd smart-day-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Update the values in `.env`:
   - Get Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard)
   - Get Groq API key from [console.groq.com](https://console.groq.com)

4. **Run the development servers**

   Terminal 1 - Frontend:
   ```bash
   npm run dev
   ```

   Terminal 2 - Backend:
   ```bash
   npm run backend:dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:8080`

## 🌐 Deployment

Ready to deploy? Check out our comprehensive [**Deployment Guide**](./DEPLOYMENT.md) for step-by-step instructions on deploying to:
- Frontend: **Vercel**
- Backend: **Railway** (or alternatives)

## 📁 Project Structure

```
smart-day-assistant/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API clients
│   ├── pages/              # Page components
│   └── integrations/       # Supabase integration
├── backend/                # Backend API server
│   ├── routes/             # API routes
│   └── server.js           # Express server
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
└── public/                # Static assets
```

## 🛠️ Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run backend` - Start backend server
- `npm run backend:dev` - Start backend with auto-reload

## 🔑 Environment Variables

See [`.env.example`](./.env.example) for all required environment variables.

### Frontend (.env)
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_LANGCHAIN_API_ENDPOINT` - Backend API URL

### Backend (backend/.env)
- `GROQ_API_KEY` - Groq API key for AI features
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 3001)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- AI powered by [Groq](https://groq.com/) and [LangChain](https://langchain.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/) and [Railway](https://railway.app/)

