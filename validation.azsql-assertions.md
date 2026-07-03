# Data Validation Assertions (AZSQL Equivalent)

This document acts as a conceptual mapping for assertions to ensure agents do not hallucinate out-of-scope questions and API operations stay within bounds.

While we are using Zod for runtime application schemas, these assertions serve as logical checks (often implemented as pre/post execution hooks or integration tests) to maintain strict data boundaries in our Express backend.

## 1. Request Payload Guardrails
**Goal**: Prevent malicious or unbounded input to the backend APIs.
- `ASSERT TYPEOF(req.body.codebaseContext) == STRING`
- `ASSERT LENGTH(req.body.codebaseContext) < MAX_CONTEXT_LENGTH`
- `ASSERT (req.headers.authorization MATCHES "^Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$")`

## 2. Hallucination & Scope Assertions
**Goal**: Ensure the Interviewer only asks questions related to the actual codebase context provided.
- `ASSERT (interviewer.question.keywords INTERSECT req.body.codebaseContext.keywords > THRESHOLD)`
- `ASSERT LENGTH(interviewer.output.questions) == 3`
- `ASSERT NO(interviewer.output.questions MATCHES "(?i)write code to|implement this")` -> *Viva questions are about explaining, not writing code.*

## 3. Data Integrity Assertions
**Goal**: Validate the Evaluator's structured JSON output before rendering and saving to Prisma.
- `ASSERT TYPEOF(evaluator.output.score) == NUMBER`
- `ASSERT (evaluator.output.score >= 0 AND evaluator.output.score <= 10)`
- `ASSERT TYPEOF(evaluator.output.missedPoints) == ARRAY`
- `ASSERT (evaluator.output.isPass == TRUE OR evaluator.output.isPass == FALSE)`
