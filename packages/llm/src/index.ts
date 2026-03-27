import OpenAI from 'openai';
import { env } from '@repo/config';

export class LlmService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  /**
   * Generates a chat response based on a system prompt and a user prompt.
   * Can use structured output if needed, but currently returns raw text.
   */
  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: env.CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0, // 0 for factual RAG responses
    });

    return response.choices[0]?.message?.content || "No response generated.";
  }
}
