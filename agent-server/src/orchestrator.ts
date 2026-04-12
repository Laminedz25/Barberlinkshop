import cron from 'node-cron';
import { SocialMediaAgent } from './services/social-media';
import { AdminAgent } from './services/admin-agent';
import { WPPManager } from './services/wppconnect';
import { KnowledgeService } from './services/knowledge-service';
import { AIDebugService } from './services/ai-debug';
import { DevAgent } from './services/dev-agent';
import { MonetizationEngine } from './services/monetization-engine';

export async function initializeAgents() {
  console.log('[Orchestrator] Initializing Phase 2 AI Evolution...');

  // 1. Build Initial Knowledge Map (AutoSkills Integration)
  await KnowledgeService.getInstance().buildKnowledgeMap();

  // 2. Start Autonomous Debugger
  AIDebugService.getInstance().listenForLogs();

  // 3. Start WhatsApp Client
  await WPPManager.getInstance().startGlobalClient();

  // ─── CRON SCHEDULES ───────────────────────────────────────────────

  // Knowledge Refresh: Every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    await KnowledgeService.getInstance().buildKnowledgeMap();
  });

  // Daily Content: 9 AM
  cron.schedule('0 9 * * *', async () => {
    await SocialMediaAgent.getInstance().orchestrateDailyContent();
  });

  // Engagement Scanner: Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await SocialMediaAgent.getInstance().scanAndEngageComments();
  });

  // Dev Improvement Cycle: 11 PM
  cron.schedule('0 23 * * *', async () => {
    await DevAgent.getInstance().runImprovementCycle();
  });

  // Lead Sweep & SEO Generation: Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    await MonetizationEngine.getInstance().performLeadSweep();
  });

  // Weekly Big Lead Sweep: Monday 8 AM
  cron.schedule('0 8 * * 1', async () => {
    await SocialMediaAgent.getInstance().runLeadGenerationCycle();
  });

  // System Evaluation: Hourly
  cron.schedule('0 * * * *', async () => {
    await AdminAgent.getInstance().evaluateSystemNeeds();
  });

  console.log('[Orchestrator] Phase 2 Neural Loop Active.');
}
