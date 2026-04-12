import OpenAI from 'openai';
import { db } from './firebase-admin';
import axios from 'axios';

/**
 * AIDebugService: Autonomous debugging engine.
 * Connects to mse_ai_api (Proxy) or OpenAI to analyze errors.
 */
export class AIDebugService {
  private static instance: AIDebugService;
  private proxyClient: OpenAI;

  private constructor() {
    // mse_ai_api typically runs on port 7777 as part of the containerized setup
    this.proxyClient = new OpenAI({
      baseURL: process.env.AI_DEBUG_PROXY_URL || 'http://localhost:7777/v1',
      apiKey: 'not-needed-for-proxy'
    });
  }

  public static getInstance(): AIDebugService {
    if (!AIDebugService.instance) {
      AIDebugService.instance = new AIDebugService();
    }
    return AIDebugService.instance;
  }

  /**
   * Analyze a system error and suggest a fix.
   */
  public async analyzeError(errorLog: { message: string, stack?: string, context?: any }) {
    console.log('[AIDebug] Analyzing critical error...');
    
    const prompt = `
      CRITICAL ERROR DETECTED IN BARBERLINK SYSTEM:
      Message: ${errorLog.message}
      Stack: ${errorLog.stack || 'N/A'}
      Context: ${JSON.stringify(errorLog.context || {})}
      
      TASK:
      1. Analyze the root cause.
      2. Suggest a specific code fix.
      3. Evaluate the security impact.
      4. Output format: JSON { "cause": "...", "fix": "...", "risk": "..." }
    `;

    try {
      const response = await this.proxyClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are a Senior DevOps & Security AI Debugger.' }, { role: 'user', content: prompt }]
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store in Firestore for the Dev Agent to process
      await db.collection('ai_proposals').add({
        type: 'BUG_FIX',
        target_error: errorLog.message,
        analysis,
        status: 'pending_review',
        created_at: new Date().toISOString()
      });

      return analysis;
    } catch (e: any) {
      console.error('[AIDebug] Analysis failed:', e.message);
      return null;
    }
  }

  /**
   * Monitor Firestore logs for new errors.
   */
  public listenForLogs() {
    db.collection('system_logs')
      .where('level', '==', 'error')
      .where('analyzed', '==', false)
      .onSnapshot(async (snapshot) => {
        for (const doc of snapshot.docs) {
          const log = doc.data();
          const analysis = await this.analyzeError({ message: log.message, context: log.context });
          if (analysis) {
            await doc.ref.update({ analyzed: true, ai_analysis_ref: analysis });
          }
        }
      });
  }
}
