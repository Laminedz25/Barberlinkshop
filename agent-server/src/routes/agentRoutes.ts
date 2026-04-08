import { Router } from 'express';
import { SocialMediaAgent } from '../services/social-media';

export const agentRouter = Router();

// Endpoint for the Admin dashboard to manually trigger social media agent
agentRouter.post('/trigger/social', async (req, res) => {
  try {
    // Fire and forget
    SocialMediaAgent.getInstance().orchestrateDailyContent();
    res.json({ status: 'started', message: 'Social Media Agent triggered successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
