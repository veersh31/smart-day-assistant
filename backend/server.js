import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiInsightsRouter from './routes/ai-insights.js';

// Load environment variables from the backend directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Allow frontend domains
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://your-app.vercel.app' // Add your Vercel domain here
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/ai', aiInsightsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LangChain AI Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 LangChain AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
