import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiInsightsRouter from './routes/ai-insights.js';

// Load environment variables from the backend directory
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
