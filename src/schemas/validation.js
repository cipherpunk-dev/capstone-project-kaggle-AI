import { z } from 'zod';

export const EvaluatorResponseSchema = z.object({
  score: z.number().min(0).max(10).describe("A score out of 10 representing the accuracy and depth of the answer."),
  feedback: z.string().describe("Constructive feedback on what the user did well."),
  missedPoints: z.array(z.string()).describe("An array of specific architectural or security points the user missed."),
  isPass: z.boolean().describe("Whether the answer meets the minimum threshold for a senior engineer.")
});

export const InterviewerResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A technical viva question."),
      contextReferenced: z.string().describe("The specific file or architectural pattern this question targets.")
    })
  ).length(3).describe("An array of exactly 3 questions.")
});
