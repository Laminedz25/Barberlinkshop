import { AGENT_REGISTRY, AgentDefinition } from './AgentRegistry';

/**
 * AgentRouter (Orchestration Tier)
 * Handles delegating user events to the correct specialized agent.
 * Integration points: Redis (Short-term), Vector DB (Long-term), LLM API.
 */
export class AgentRouter {
  
  /**
   * Identifies the primary intent of the user query.
   * In a real system, this would be an LLM call to classify the intent.
   */
  private async identifyIntent(query: string): Promise<string> {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('book') || lowercaseQuery.includes('salon')) return 'customer_support';
    if (lowercaseQuery.includes('remind') || lowercaseQuery.includes('client')) return 'barber_assistant';
    if (lowercaseQuery.includes('problem') || lowercaseQuery.includes('complain') || lowercaseQuery.includes('refund')) return 'escalation_agent';
    if (lowercaseQuery.includes('post') || lowercaseQuery.includes('share')) return 'marketing_social';
    if (lowercaseQuery.includes('profit') || lowercaseQuery.includes('revenue')) return 'ai_business_brain';
    if (lowercaseQuery.includes('server') || lowercaseQuery.includes('down')) return 'maintenance_agent';
    if (lowercaseQuery.includes('hack') || lowercaseQuery.includes('secure')) return 'security_agent';
    
    return 'customer_support'; // Default
  }

  /**
   * Main delegation entry point.
   */
  public async handleEvent(query: string, context: { userId: string, sessionId: string }) {
    // 1. Route Intent
    const agentId = await this.identifyIntent(query);
    const agentDef = AGENT_REGISTRY[agentId];
    
    console.log(`[AgentRouter] Delegating to: ${agentId}`);

    // 2. Load Long-term Memory (Mocked RAG retrieval)
    const longTermMem = await this.retrieveVectorMemory(query, agentDef);

    // 3. Load Short-term Memory (Mocked Redis context)
    const shortTermMem = await this.retrieveRedisContext(context.sessionId);

    // 4. Build Agent Prompt
    const fullPrompt = `
      ${agentDef.systemPrompt}
      LONG TERM MEMORY: ${longTermMem}
      SHORT TERM CONTEXT: ${shortTermMem}
      USER QUERY: ${query}
    `;

    // 5. Execute via LLM (Mocked)
    return {
      agentId,
      response: `[SIMULATED RESPONSE FROM ${agentId}] I've processed your request: "${query}" based on the platform rules.`,
      status: 'completed',
      metadata: { roles: agentDef.role, boundaries: agentDef.boundaries }
    };
  }

  private async retrieveVectorMemory(query: string, agentDef: AgentDefinition): Promise<string> {
     if (agentDef.memoryType === 'short') return 'N/A';
     return "Pre-indexed knowledge regarding BarberLink procedures and FAQs.";
  }

  private async retrieveRedisContext(sessionId: string): Promise<string> {
     return "Previous 2 messages from the user about booking a haircut at Algiers.";
  }
}

export const agentRouter = new AgentRouter();
