import { GoogleGenAI } from '@google/genai';
import { InterviewerResponseSchema } from '../schemas/validation.js';

export class InterviewerAgent {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
    // Assuming gemini-2.5-flash as default, but can be configured
    this.modelName = 'gemini-2.5-flash';
  }

  async generateQuestion(codeContext, history = []) {
    const systemInstruction = `
You are a senior backend architect conducting a mock technical viva for a candidate on their Node.js and Express project.
Your goal is to test their intuition and logical application of their code architecture. 

Context will be provided containing file names and code snippets from their local project.

Rules:
1. Ask exactly THREE distinct questions.
2. Questions should focus on design decisions, potential edge cases, security (e.g., RBAC, input validation), and scalability.
3. Do NOT evaluate their previous answer. Only ask the next logical questions based on the provided code context.
`;

    // Formatting history for context
    const historyText = history.map(turn => `Q: ${turn.question}\nA: ${turn.answer}`).join('\n\n');

    const prompt = `
=== CODE CONTEXT ===
${codeContext}
====================

=== HISTORY ===
${historyText ? historyText : 'No history yet. This is the first question set.'}
===============

Based on the code context above, please ask the next 3 technical viva questions.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              questions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    contextReferenced: { type: 'STRING' }
                  },
                  required: ['question', 'contextReferenced']
                }
              }
            },
            required: ['questions']
          },
          temperature: 0.7
        }
      });

      const parsed = JSON.parse(response.text);
      return parsed;
    } catch (error) {
      console.error("Error in InterviewerAgent:", error.message);
      return {
        questions: [
          { question: "Could you explain the overarching architecture of your application?", contextReferenced: "General" },
          { question: "How are you handling database connections?", contextReferenced: "General" },
          { question: "What security measures are in place?", contextReferenced: "General" }
        ]
      };
    }
  }
}
