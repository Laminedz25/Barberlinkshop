import { db } from './firebase-admin';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';

/**
 * MonetizationEngine: The Revenue Generator.
 * Handles:
 * 1. Referral/Affiliate logic
 * 2. Automated SEO content generation (Best Barber in X)
 * 3. Smart Lead Outreach
 */
export class MonetizationEngine {
  private static instance: MonetizationEngine;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  public static getInstance(): MonetizationEngine {
    if (!MonetizationEngine.instance) {
      MonetizationEngine.instance = new MonetizationEngine();
    }
    return MonetizationEngine.instance;
  }

  /**
   * 1. Process a referral attribution.
   */
  public async handleReferral(referrerId: string, newUserId: string) {
    console.log(`[Monetization] Processing referral from ${referrerId} for ${newUserId}`);
    try {
      const configDoc = await db.collection('system').doc('config').get();
      const bonus = configDoc.data()?.referral_bonus_dzd || 500;

      // Update Referrer Balance
      await db.collection('wallets').doc(referrerId).update({
        balance_dzd: (await db.collection('wallets').doc(referrerId).get()).data()?.balance_dzd + bonus,
        referral_earnings: (await db.collection('wallets').doc(referrerId).get()).data()?.referral_earnings + bonus,
        last_updated: new Date().toISOString()
      });

      // Log link
      await db.collection('referrals').add({
        referrer: referrerId,
        referred: newUserId,
        bonus_awarded: bonus,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[Monetization] Referral verified. +${bonus} DZD to referrer.`);
    } catch (e: any) {
      console.error('[Monetization] Referral failed:', e.message);
    }
  }

  /**
   * 2. SEO Content Generation: Create articles for specific cities.
   */
  public async generateSEOBlock(city: string, country: string) {
    console.log(`[Monetization] Generating AI SEO content for ${city}, ${country}`);
    
    const prompt = `
      Create a highly optimized SEO blog post for BarberLink.
      TOPIC: Best Barbers and Grooming Culture in ${city}, ${country}.
      LANGUAGE: Both Arabic and English.
      Include 3 subheadings.
      Format: JSON { "title": "...", "content_en": "...", "content_ar": "...", "keywords": [...] }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are an SEO & Content Growth Hacker.' }, { role: 'user', content: prompt }]
      });

      const blog = JSON.parse(response.choices[0].message.content || '{}');
      
      await db.collection('seo_posts').add({
        city,
        country,
        ...blog,
        status: 'published',
        created_at: new Date().toISOString()
      });

      console.log(`[Monetization] SEO Post published for ${city}.`);
    } catch (e: any) {
      console.error('[Monetization] SEO failed:', e.message);
    }
  }

  /**
   * 3. AI Lead Outreach: Find barbers via "Global Search" and email them.
   */
  public async performLeadSweep() {
    console.log('[Monetization] Initiating global lead sweep...');
    // Real logic would use SerpAPI. Here we simulate discovery.
    const cities = ['Algiers', 'Oran', 'Dubai', 'London', 'Casablanca'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    await this.generateSEOBlock(randomCity, 'Global');
    
    // Simulate finding a lead
    const lead = { name: 'The Golden Scissors', email: 'barber@example.com' };
    console.log(`[Monetization] Lead discovered: ${lead.name}`);
    
    // Dev Agent triggers Admin approval for outreach if needed, or here we just log it
    await db.collection('leads').add({
      ...lead,
      city: randomCity,
      status: 'discovered',
      source: 'AI_SWEEP'
    });
  }
}
