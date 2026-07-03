# Skill Definitions

This document outlines the specific tool-calling capabilities (skills) required for the system to interact with the local codebase and orchestrate the agents.

## 1. MCP Core Skills (Exposed to Orchestrator)

The Orchestrator utilizes the Model Context Protocol (MCP) to access local files securely. These are the tools exposed by the `mcp-server-filesystem`:

- `list_directory`: Lists all files and folders in a specified project directory to understand the project structure.
- `read_file`: Reads the exact contents of specific `.js` or `.json` files (e.g., `package.json`, `app.js`, `controllers/patientController.js`) to feed into the agents' context.

## 2. Agent Skills

While the agents do not execute local terminal commands directly, they rely on tools provided via the Gemini API to structure their interactions:

### 2.1 Interviewer Skills
- `request_file_content(filePath)`: An abstract skill allowing the Interviewer to ask the Orchestrator for the contents of a specific file it discovered during the initial directory listing. 

### 2.2 Evaluator Skills
- `submit_evaluation(score, feedback, missing_points)`: A structured output tool enforced via Zod schemas, ensuring the Evaluator always replies in a machine-readable JSON format for the Orchestrator to parse and display elegantly.
