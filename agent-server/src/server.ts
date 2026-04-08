import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeAgents } from './orchestrator';
import { wppRouter } from './routes/wppRoutes';
import { agentRouter } from './routes/agentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wpp', wppRouter);
app.use('/api/agents', agentRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Autonomous AI Server is running flawlessly.' });
});

app.listen(PORT, async () => {
  console.log(`[Agent-Server] Core initialized on port ${PORT}`);
  // Initialize cron jobs and WPPConnect instances
  await initializeAgents();
});
