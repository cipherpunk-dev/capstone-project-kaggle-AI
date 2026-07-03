# Phased Conversational Flow

This document outlines how the Orchestrator manages the transition of states between the Interviewer, the User, and the Evaluator.

## Phase 1: Context Initialization
1. CLI starts. Orchestrator connects to the MCP File-System server.
2. Orchestrator calls `list_directory` on the target path.
3. Orchestrator identifies key files (e.g., `package.json`, routes, controllers) and calls `read_file` to load them into memory.

## Phase 2: Analysis & Question Generation
1. Orchestrator passes the aggregated file contents to the Interviewer agent as system context.
2. Interviewer analyzes the architecture.
3. Interviewer generates the first viva question.
4. Orchestrator prints the question to the terminal.

## Phase 3: User Interaction
1. Orchestrator waits for user input via standard stdin prompt (e.g., `> Your answer:`).
2. User types their response and hits Enter.

## Phase 4: Evaluation & Grading
1. Orchestrator bundles the (Code Context) + (Interviewer's Question) + (User's Answer).
2. Orchestrator sends this bundle to the Evaluator agent.
3. Evaluator processes the bundle and returns structured JSON (Score, Feedback, Missed Points).
4. Orchestrator parses the JSON and renders a beautiful, colored terminal output for the user.

## Phase 5: Iteration
1. Orchestrator updates the conversation history.
2. Control returns to Phase 2, where the Interviewer generates the next question based on the history and code context.
3. The loop continues for a predefined number of turns (e.g., 3-5 questions) or until the user types `exit`.
