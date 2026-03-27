import { SystemConfig } from "@/hooks/useSystemConfig";

/**
 * Universal AI Service for BarberLink Global Platform
 * Handles both Fallback (Logit-based) and Generative (GPT-based) intelligence.
 */
export const getAIResponse = async (
  query: string, 
  config: SystemConfig | null, 
  systemPrompt?: string,
  language: string = 'ar'
): Promise<string> => {
  
  // 1. Check if ChatGPT API Key is available
  if (config?.openaiKey && config.openaiKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o", // Premium model for Level 3 Autonomy
          messages: [
            { role: "system", content: systemPrompt || "You are a helpful assistant for BarberLink." },
            { role: "user", content: query }
          ],
          temperature: 0.7,
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.error("OpenAI Bridge Error:", err);
      // Fallback if API fails
    }
  }

  // 2. Deterministic Fallback Logic (Level 3 Safety Net)
  const q = query.toLowerCase();
  
  if (q.includes("احجز") || q.includes("حجز") || q.includes("book")) {
    return language === 'ar' 
        ? "أهلاً بك! يمكنك الحجز فوراً عبر اختيار الحلاق من الخارطة واختيار الخدمات المطلوبة. النظام يقوم بالتنسيق آلياً."
        : "Welcome! You can book immediately by selecting a barber from the Map and choosing your services. The system handles synchronization automatically.";
  }
  
  if (q.includes("سعر") || q.includes("price") || q.includes("subscription")) {
    return language === 'ar'
        ? "لدينا باقات متنوعة (أساسي، برو، بريميوم) تدعم DZD و USD. يمكنك الاطلاع عليها من قسم التسعير."
        : "We have various plans (Basic, Pro, Premium) supporting DZD and USD. Check the pricing section for details.";
  }

  return language === 'ar'
      ? "بصفتي المساعد الذكي لـ BarberLink، يسعدني خدمتك. سأقوم بتوجيه استفسارك للقسم المختص أو مساعدتك في الحجز الآن."
      : "As BarberLink AI, I'm happy to help. I'll guide your query or assist you with booking right now.";
};
