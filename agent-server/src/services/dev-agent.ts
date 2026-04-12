import { db } from './firebase-admin';
import { KnowledgeService } from './knowledge-service';
import OpenAI from 'openai';

/**
 * DevAgent: The Autonomous Developer.
 * Analyzes the knowledge map and suggests improvements.
 */
export class DevAgent {
  private static instance: DevAgent;
  private openai: OpenAI;

  private constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  public static getInstance(): DevAgent {
    if (!DevAgent.instance) {
      DevAgent.instance = new DevAgent();
    }
    return DevAgent.instance;
  }

  /**
   * Run an improvement cycle.
   */
  public async runImprovementCycle() {
    console.log('[DevAgent] Evaluating platform for growth...');
    const manifest = KnowledgeService.getInstance().getManifest();
    
    if (!manifest || !manifest.techStack) {
      await KnowledgeService.getInstance().buildKnowledgeMap();
    }

    const prompt = `
      SYSTEM CONTEXT (BarberLink):
      Tech Stack: ${JSON.stringify(manifest.techStack)}
      Backend Services: ${JSON.stringify(manifest.modules.backend_services)}
      Frontend Pages: ${JSON.stringify(manifest.modules.frontend_pages)}
      
      OBJECTIVE:
      1. Propose one technical improvement (refactoring, security, performance).
      2. Propose one new UI feature to increase user engagement.
      3. Format: JSON { "tech_fix": "...", "new_feature": "...", "estimated_impact": "high/medium" }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo', // High-level reasoning for Dev Agent
        messages: [{ role: 'system', content: 'You are the Autonomous Tech Lead of BarberLink.' }, { role: 'user', content: prompt }]
      });

      const proposal = JSON.parse(response.choices[0].message.content || '{}');
      
      await db.collection('ai_proposals').add({
        type: 'PLATFORM_GROWTH',
        proposal,
        status: 'pending_review',
        created_at: new Date().toISOString()
      });

      console.log('[DevAgent] Growth proposals submitted to Admin Dashboard.');
    } catch (e: any) {
      console.error('[DevAgent] Improvement cycle failed:', e.message);
    }
  }
}
