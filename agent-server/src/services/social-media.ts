import OpenAI from 'openai';
import nodemailer from 'nodemailer';
import { db } from './firebase-admin';
import { AdminAgent } from './admin-agent';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Email transporter via SMTP (configure in .env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class SocialMediaAgent {
  private static instance: SocialMediaAgent;

  public static getInstance(): SocialMediaAgent {
    if (!SocialMediaAgent.instance) {
      SocialMediaAgent.instance = new SocialMediaAgent();
    }
    return SocialMediaAgent.instance;
  }

  /**
   * 1. Daily content generation for social media
   */
  public async orchestrateDailyContent() {
    console.log('[SocialMediaAgent] Generating Global Viral Content...');
    try {
      const enCaption = await this.generateCaption('en');
      const arCaption = await this.generateCaption('ar');

      await AdminAgent.getInstance().logDecision('social_media', 'CONTENT_GENERATED', { 
        captions: { en: enCaption, ar: arCaption } 
      });

      console.log('[SocialMediaAgent] Content cycle complete.');
    } catch (e: any) {
      console.error('[SocialMediaAgent] Content failed:', e.message);
    }
  }

  /**
   * 2. Lead Generation – search for barbers globally
   */
  public async runLeadGenerationCycle() {
    console.log('[SocialMediaAgent] Running lead generation cycle...');
    try {
       // Search logic... (Simulated)
       const leads = [
         { name: 'Elite Salon', email: 'elite@example.com', city: 'NYC', country: 'USA' },
         { name: 'Parisian Fade', email: 'paris@example.com', city: 'Paris', country: 'FR' }
       ];

       for(const lead of leads) {
          await this.sendRecruitmentEmail(lead);
          await AdminAgent.getInstance().logDecision('social_media', 'LEAD_CONTACTED', { lead: lead.email });
       }
    } catch (e: any) {
       console.error('[SocialMediaAgent] Lead cycle failed:', e.message);
    }
  }

  public async sendRecruitmentEmail(lead: { name: string; email: string; city: string; country: string }) {
    if (!process.env.SMTP_USER) return;
    
    // Using AI-generated email body based on country
    const subject = `🌟 ${lead.name} – Global Invitation to BarberLink Elite Mesh`;
    const html = `<div style="background:#000;color:#fff;padding:20px;border-radius:10px;">
       <h1>Join BarberLink Node Protocol</h1>
       <p>Hello ${lead.name}, your shop in ${lead.city} is a perfect candidate for our global AI-governed ecosystem.</p>
       <a href="https://barberlink.cloud" style="color:#d4af37;font-weight:bold;">ACCESS NEURAL CORE →</a>
    </div>`;

    await transporter.sendMail({
      from: `"BarberLink Platform" <${process.env.SMTP_USER}>`,
      to: lead.email,
      subject,
      html,
    });
  }

  private async generateCaption(language: 'en' | 'ar'): Promise<string> {
    const agentDoc = await db.collection('ai_agents').doc('social_media').get();
    const systemPrompt = agentDoc.data()?.systemPrompt || 
      (language === 'en' 
        ? 'Punchy viral caption for @barberlink_cloud. Focus: Global Barber SaaS. Emojis mandatory.' 
        : 'منشور فيروسي لـ BarberLink. التركيز على الحلاقة والأتمتة.');

    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a new caption in ${language === 'en' ? 'English' : 'Arabic'}.` }
      ],
      max_tokens: 150,
    });
    return res.choices[0].message.content || '';
  }
}
