# Mock-Viva & Code-Review Assistant

A powerful, decoupled full-stack SaaS application designed to act as an automated mock-viva examiner and intelligent code-review assistant. Leveraging the Google Gemini API, this application analyzes your codebase to generate architectural questions, evaluates your responses, and provides constructive feedback. It aims to help developers prepare for technical interviews and provides teams with automated insights into their architectural decisions.

## Tech Stack Overview

- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **AI Integration:** Google Gemini API
- **Frontend:** React, Vite, Tailwind CSS

## Prerequisites

Before setting up the project, ensure you have the following ready:
- **Node.js**: Installed on your machine.
- **Supabase Account**: A free account to host the PostgreSQL database.
- **Google AI Studio API Key**: A free key to access the Gemini API.

## Environment Variables

To configure the application securely, you need to set up your environment variables. 
Copy the provided `.env.example` file to a new file named `.env` in the root directory:

```bash
cp .env.example .env
```

Open the new `.env` file and provide your own credentials:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string.
- `GEMINI_API_KEY`: Your Google AI Studio API key.

*Note: The `.env.example` file outlines exactly what keys are expected.*

## Installation

Follow these steps to install the necessary dependencies for both the backend and frontend:

1. **Install backend dependencies** (from the root directory):
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Return to the root directory**:
   ```bash
   cd ..
   ```

## Database Setup

To automatically build the necessary tables in your blank Supabase database without having to write SQL, run the following Prisma command from the root directory:

```bash
npx prisma db push
```

This command reads the `schema.prisma` file and seamlessly synchronizes your database schema.

## Running the App

To run the full-stack application, you will need to open **two separate terminal windows**.

**Terminal 1: Start the Backend**
From the root directory, start the Node.js/Express server:
```bash
npm run dev
```

**Terminal 2: Start the Frontend**
Navigate to the frontend directory and start the Vite development server:
```bash
cd frontend
npm run dev
```

The application will now be running, and you can access the frontend via the local Vite URL provided in Terminal 2 (usually `http://localhost:5173`), which securely communicates with your backend server.
