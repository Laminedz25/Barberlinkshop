import OpenAI from 'openai';
import nodemailer from 'nodemailer';
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

// Simulated leads database (in production: store in Firestore)
const sentLeads: Set<string> = new Set();

export class SocialMediaAgent {
  private static instance: SocialMediaAgent;

  public static getInstance(): SocialMediaAgent {
    if (!SocialMediaAgent.instance) {
      SocialMediaAgent.instance = new SocialMediaAgent();
    }
    return SocialMediaAgent.instance;
  }

  //──────────────────────────────────────────────
  // 1. Daily content generation for social media
  //──────────────────────────────────────────────
  public async orchestrateDailyContent() {
    console.log('[SocialMediaAgent] Generating Global Viral Content...');
    try {
      // Generate in English
      const enCaption = await this.generateCaption('en');
      // Generate in Arabic
      const arCaption = await this.generateCaption('ar');

      console.log('[SocialMediaAgent] EN Caption:', enCaption);
      console.log('[SocialMediaAgent] AR Caption:', arCaption);

      // TODO: Publish via Meta Graph API / TikTok API
      // await this.publishToInstagram(enCaption);
      // await this.publishToTikTok(enCaption);

      console.log('[SocialMediaAgent] Content cycle complete.');
    } catch (e: any) {
      console.log('[SocialMediaAgent] Content generation failed:', e.message);
    }
  }

  //──────────────────────────────────────────────
  // 2. Scan & engage comments and DMs
  //──────────────────────────────────────────────
  public async scanAndEngageComments() {
    console.log('[SocialMediaAgent] Scanning comments/DMs...');
    // TODO: Connect to platform webhooks for incoming messages
  }

  //──────────────────────────────────────────────
  // 3. Lead Generation – search for barbers globally
  //──────────────────────────────────────────────
  public async runLeadGenerationCycle() {
    console.log('[SocialMediaAgent] Running lead generation cycle...');

    // Simulated leads from scraping (in production: use Google Maps API / SerpAPI)
    const simulatedLeads = [
      { name: 'Elite Cuts Studio', email: 'elite@barbershop.com', city: 'London', country: 'UK' },
      { name: 'Fade Masters NYC', email: 'fade@nyc.com', city: 'New York', country: 'USA' },
      { name: 'Le Barbershop Paris', email: 'bar@paris.fr', city: 'Paris', country: 'France' },
      { name: 'Royal Barbers Dubai', email: 'royal@dubai.ae', city: 'Dubai', country: 'UAE' },
    ];

    for (const lead of simulatedLeads) {
      if (!sentLeads.has(lead.email)) {
        await this.sendRecruitmentEmail(lead);
        sentLeads.add(lead.email);
        // Prevent spam rate limit
        await this.sleep(2000);
      }
    }
    console.log(`[SocialMediaAgent] Lead cycle complete. Total sent: ${sentLeads.size}`);
  }

  //──────────────────────────────────────────────
  // 4. Send beautiful recruitment email
  //──────────────────────────────────────────────
  public async sendRecruitmentEmail(lead: { name: string; email: string; city: string; country: string }) {
    if (!process.env.SMTP_USER) {
      console.log('[SocialMediaAgent] SMTP not configured, skipping email send.');
      return;
    }
    
    const subject = `🌟 ${lead.name} – Your Barbershop Deserves the World's Best Platform`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BarberLink Invitation</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:40px auto;">
    <tr>
      <td style="background:linear-gradient(135deg,#d4af37,#f5d770);padding:40px;border-radius:24px 24px 0 0;text-align:center;">
        <h1 style="margin:0;color:#000;font-size:32px;font-weight:900;letter-spacing:-1px;">
          ✂ BarberLink
        </h1>
        <p style="margin:8px 0 0;color:#333;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">
          The Autonomous Barbershop Platform
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#1a1a1a;padding:40px;border-radius:0 0 24px 24px;">
        <h2 style="color:#fff;font-size:22px;margin:0 0 16px;">
          Hello ${lead.name} 👋
        </h2>
        <p style="color:#aaa;line-height:1.7;font-size:15px;">
          We've been observing the barber scene in <strong style="color:#d4af37">${lead.city}, ${lead.country}</strong>, 
          and <strong style="color:#fff">${lead.name}</strong> caught our eye. 
          You're clearly doing something right — and we want to help you do it even better.
        </p>
        
        <div style="background:#111;border:1px solid #333;border-radius:16px;padding:24px;margin:24px 0;">
          <h3 style="color:#d4af37;margin:0 0 16px;font-size:16px;text-transform:uppercase;letter-spacing:2px;">
            Why Join BarberLink?
          </h3>
          <p style="color:#ccc;margin:8px 0;font-size:14px;">✅ <strong>AI-powered booking system</strong> — works 24/7</p>
          <p style="color:#ccc;margin:8px 0;font-size:14px;">✅ <strong>WhatsApp automation</strong> — auto-confirm appointments</p>
          <p style="color:#ccc;margin:8px 0;font-size:14px;">✅ <strong>Your own online store</strong> — sell products globally</p>
          <p style="color:#ccc;margin:8px 0;font-size:14px;">✅ <strong>Neural business insights</strong> — AI tracks your revenue</p>
          <p style="color:#ccc;margin:8px 0;font-size:14px;">✅ <strong>Zero monthly fees</strong> to start — grow then pay</p>
        </div>

        <div style="text-align:center;margin:32px 0;">
          <a href="https://barberlink.cloud" style="background:linear-gradient(135deg,#d4af37,#f5d770);color:#000;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:900;font-size:16px;display:inline-block;letter-spacing:0.5px;">
            🚀 JOIN BARBERLINK FREE →
          </a>
        </div>

        <p style="color:#555;font-size:13px;text-align:center;margin:0;">
          Thousands of barbers globally are already growing faster with BarberLink.<br>
          You're invited to be one of the first in ${lead.country}.
        </p>
        
        <hr style="border:none;border-top:1px solid #333;margin:32px 0;">
        
        <p style="color:#444;font-size:12px;text-align:center;margin:0;">
          BarberLink Autonomous Platform • barberlink.cloud<br>
          You're receiving this because of your presence as a professional barbershop.<br>
          <a href="mailto:support@barberlink.cloud" style="color:#d4af37;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      await transporter.sendMail({
        from: `"BarberLink Platform" <${process.env.SMTP_USER}>`,
        to: lead.email,
        subject,
        html,
      });
      console.log(`[SocialMediaAgent] Email sent to ${lead.email}`);
    } catch (e: any) {
      console.error(`[SocialMediaAgent] Failed to send to ${lead.email}:`, e.message);
    }
  }

  //──────────────────────────────────────────────
  // 5. Send follow-up reminder to non-responders
  //──────────────────────────────────────────────
  public async sendFollowUpReminders() {
    console.log('[SocialMediaAgent] Sending follow-up reminders...');
    // In production: query firestore for leads that opened email but didn't register (>3 days ago)
  }

  //──────────────────────────────────────────────
  // Private helpers
  //──────────────────────────────────────────────
  private async generateCaption(language: 'en' | 'ar'): Promise<string> {
    const prompt = language === 'en'
      ? 'Generate a viral Instagram caption for a barbershop SaaS platform called BarberLink. Be punchy, exciting, use emojis. Max 150 chars. Include "barberlink.cloud". Reference global barber culture.'
      : 'اكتب منشوراً فيروسياً لإنستغرام منصة حجز حلاقة تسمى BarberLink. كن مشوقاً واستخدم الإيموجي. 150 حرف كحد أقصى. اذكر barberlink.cloud';

    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });
    return res.choices[0].message.content || '';
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
