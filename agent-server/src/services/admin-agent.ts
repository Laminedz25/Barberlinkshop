import { Telegraf } from 'telegraf';
import { db } from './firebase-admin';
import { SocialMediaAgent } from './social-media';
import dotenv from 'dotenv';
dotenv.config();

/**
 * AdminAgent: The Master Orchestrator with Telegram Interface.
 * Allows remote control of the platform via Telegram.
 */
export class AdminAgent {
  private static instance: AdminAgent;
  private bot: Telegraf;

  private constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
    this.setupTelegramCommands();
  }

  public static getInstance(): AdminAgent {
    if (!AdminAgent.instance) {
      AdminAgent.instance = new AdminAgent();
    }
    return AdminAgent.instance;
  }

  public start() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.log('[AdminAgent] TELEGRAM_BOT_TOKEN missing. Bot disabled.');
      return;
    }
    this.bot.launch();
    console.log('[AdminAgent] Telegram Control Mesh Active.');
  }

  private setupTelegramCommands() {
    this.bot.start((ctx) => ctx.reply('🤖 BarberLink Neural Core Online. Send /status for system health.'));

    this.bot.command('status', async (ctx) => {
      const barbers = await db.collection('barbers').count().get();
      const users = await db.collection('users').count().get();
      ctx.reply(`📊 System Health:\n- Barbers: ${barbers.data().count}\n- Users: ${users.data().count}\n- Fleet Status: STABLE`);
    });

    this.bot.command('trigger_social', async (ctx) => {
      ctx.reply('🚀 Triggering Social Media Agent content cycle...');
      await SocialMediaAgent.getInstance().orchestrateDailyContent();
      ctx.reply('✅ Social Media cycle complete.');
    });

    this.bot.command('leads', async (ctx) => {
       ctx.reply('🔎 Scanning global leads...');
       await SocialMediaAgent.getInstance().runLeadGenerationCycle();
       ctx.reply('✅ Global Lead Cycle finished.');
    });

    // Administrative AI: Explain system prompt updates
    this.bot.on('text', async (ctx) => {
       const text = ctx.message.text;
       if (text.startsWith('Update Prompt:')) {
          const content = text.replace('Update Prompt:', '').trim();
          await db.collection('ai_agents').doc('social_media').set({
             systemPrompt: content,
             last_updated: new Date().toISOString()
          }, { merge: true });
          ctx.reply('🧠 Neural Core Updated for Social Media Agent.');
       }
    });
  }

  /**
   * Log important autonomous decisions to Firestore for the Admin Dashboard.
   */
  public async logDecision(agentId: string, decision: string, context: any) {
     await db.collection('ai_memories').add({
        agent_id: agentId,
        decision,
        context,
        timestamp: new Date().toISOString()
     });
     
     // Mirror to Telegram for the owner
     if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
        this.bot.telegram.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, 
           `🧠 [AI_${agentId.toUpperCase()}] Decision: ${decision}\nContext: ${JSON.stringify(context)}`
        );
     }
  }
}
