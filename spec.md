# Product Specification: Mock-Viva & Code-Review Assistant (SaaS)

## 1. Overview
This product is a Full-Stack SaaS web application designed to act as a mock-viva examiner and code-review assistant. It replaces the legacy CLI version with a modern React frontend and a Node.js/Express backend.

## 2. Target Audience
- Developers looking to practice technical interviews (viva) on their codebase.
- Teams needing automated, interactive code reviews focused on architectural decisions.

## 3. Core Features
- **Cloud-Ready Architecture**: Decoupled React frontend (Vite/Tailwind) and Express backend API.
- **Persistent History**: Uses PostgreSQL (via Prisma) to store users, projects, and viva sessions.
- **Interactive Interviewing**: An "Interviewer" agent analyzes provided code context and asks 3 architectural/logic-based questions.
- **Evaluation & Feedback**: An "Evaluator" agent grades the developer's answers and provides constructive feedback.
- **Modern Dashboard**: A dashboard to track average scores, total projects reviewed, and past sessions.

## 4. User Flow
1. **Authentication**: User logs in or registers via the secure JWT-based login screen.
2. **Dashboard**: User lands on the analytics dashboard to view past performance.
3. **Initialization**: User starts a new Viva Session and pastes/uploads their target codebase context.
4. **Questioning**: The backend Interviewer formulates 3 questions about the code and streams them to the UI.
5. **Answering**: User types their responses into the interactive dual-pane interface.
6. **Evaluation**: The backend Evaluator grades the responses, saves the result to the database, and returns the feedback.
7. **Review**: The user views their final score (out of 10), passing status, and areas for improvement.

## 5. Security & Privacy
- **Stateless Auth**: JWT is used for securing API endpoints.
- **Data Validation**: Zod is used to strictly validate incoming API request payloads and outgoing LLM JSON schemas.
- **No Remote Execution**: The agents only read context; no remote code execution is allowed.
