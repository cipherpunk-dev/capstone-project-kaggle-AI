import { GoogleGenAI } from '@google/genai';
import { EvaluatorResponseSchema } from '../schemas/validation.js';

export class EvaluatorAgent {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = 'gemini-2.5-flash';
  }

  async evaluateResponse(codeContext, questions, answers) {
    const systemInstruction = `
You are an expert technical code reviewer and mentor. You are observing a technical viva.
You will be provided with the code context, the questions asked by the Interviewer, and the candidate's answers.
Your job is to provide constructive feedback on the candidate's answers as a whole, AND a detailed analysis for each specific question.

Rules:
1. Be objective, supportive, and precise.
2. Point out what they got right, and explicitly state any critical architectural or security points they missed across their answers.
3. You MUST output your response matching the requested JSON schema exactly. Ensure 'questionEvaluations' contains a detailed review for EACH question asked.
`;

    // Map questions and answers so the LLM clearly sees which answer corresponds to which question
    let qaPairs = '';
    for(let i = 0; i < questions.length; i++) {
        const q = questions[i].question || questions[i];
        const a = answers[i] || 'No answer provided.';
        qaPairs += `\n--- Question ${i+1} ---\nQ: ${q}\nA: ${a}\n`;
    }

    const prompt = `
=== CODE CONTEXT ===
${codeContext}
====================

=== CANDIDATE Q&A ===
${qaPairs}
=====================

Evaluate the candidate's answers based on the code context. Provide an overall score, overall feedback, and detailed feedback per question.
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
              score: { type: 'NUMBER', description: 'Overall score out of 10' },
              feedback: { type: 'STRING', description: 'Overall summary of the candidate performance' },
              missedPoints: { type: 'ARRAY', items: { type: 'STRING' }, description: 'High-level missed concepts' },
              isPass: { type: 'BOOLEAN' },
              questionEvaluations: {
                type: 'ARRAY',
                description: 'Detailed evaluation for each question',
                items: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    score: { type: 'NUMBER', description: 'Score for this specific question out of 10' },
                    feedback: { type: 'STRING', description: 'Detailed analysis of the answer' },
                    missedPoints: { type: 'ARRAY', items: { type: 'STRING' }, description: 'What was missed in this answer' }
                  },
                  required: ['question', 'score', 'feedback', 'missedPoints']
                }
              }
            },
            required: ['score', 'feedback', 'missedPoints', 'isPass', 'questionEvaluations']
          },
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text);
      return parsed;
    } catch (error) {
      console.error("Error in EvaluatorAgent:", error.message);
      return {
        score: 0,
        feedback: "Error evaluating response due to LLM failure.",
        missedPoints: [],
        isPass: false
      };
    }
  }
}
