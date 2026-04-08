import cron from 'node-cron';
import { SocialMediaAgent } from './services/social-media';
import { AdminAgent } from './services/admin-agent';
import { WPPManager } from './services/wppconnect';

export async function initializeAgents() {
  console.log('[Orchestrator] Starting Autonomous Node Agents...');

  // Start WhatsApp Client
  await WPPManager.getInstance().startGlobalClient();

  // Every day at 9 AM, the social media agent generates and publishes content
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Triggering Daily Social Media Cycle');
    await SocialMediaAgent.getInstance().orchestrateDailyContent();
  });

  // Every 5 minutes, scan comments and DMs
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Triggering Engagement Scanner');
    await SocialMediaAgent.getInstance().scanAndEngageComments();
  });

  // Every Monday at 8 AM: lead generation global sweep
  cron.schedule('0 8 * * 1', async () => {
    console.log('[Cron] Triggering Weekly Lead Generation');
    await SocialMediaAgent.getInstance().runLeadGenerationCycle();
  });

  // Every Friday at 10 AM: follow-up reminders
  cron.schedule('0 10 * * 5', async () => {
    console.log('[Cron] Triggering Follow-Up Reminders');
    await SocialMediaAgent.getInstance().sendFollowUpReminders();
  });

  // Every hour, admin agent evaluates system needs
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Triggering System Evaluation');
    await AdminAgent.getInstance().evaluateSystemNeeds();
  });

  console.log('[Orchestrator] All CRON Jobs registered.');
}
