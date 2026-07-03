# Validation & Security Guardrails

This document outlines the strict validation schemas used to ensure the agents communicate in expected formats, specifically for the Evaluator agent, whose output must be machine-readable. We utilize `zod` to enforce these schemas at runtime.

## 1. Security Guardrails
- **Input Sanitization**: All user input must be treated as untrusted. The backend strictly validates HTTP request payloads (e.g., login, evaluating answers) before passing them to the agents.
- **Context Isolation**: The agents only read the `codebaseContext` explicitly provided in the request payload. They do not have access to the local file system of the server or the user's machine.
- **JWT Authentication**: All agent-triggering API endpoints require a valid JWT token to prevent unauthorized access.

## 2. Zod Schemas

### 2.1 Evaluator Output Schema

When the Evaluator generates a response, it is forced to adhere to this JSON structure:

```typescript
import { z } from 'zod';

export const EvaluatorResponseSchema = z.object({
  score: z.number().min(0).max(10).describe("A score out of 10 representing the accuracy and depth of the answer."),
  feedback: z.string().describe("Constructive feedback on what the user did well."),
  missedPoints: z.array(z.string()).describe("An array of specific architectural or security points the user missed."),
  isPass: z.boolean().describe("Whether the answer meets the minimum threshold for a senior engineer.")
});
```

### 2.2 Interviewer Output Schema
To ensure the Interviewer doesn't hallucinate arbitrary questions, it must return exactly 3 questions:

```typescript
export const InterviewerResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("A technical viva question."),
      contextReferenced: z.string().describe("The specific file or architectural pattern this question targets.")
    })
  ).length(3).describe("An array of exactly 3 questions.")
});
```
