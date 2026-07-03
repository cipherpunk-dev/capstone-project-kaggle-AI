import express from 'express';
import { InterviewerAgent } from '../agents/interviewer.js';
import { EvaluatorAgent } from '../agents/evaluator.js';
import authMiddleware from '../middleware/auth.js';
import prisma from '../db.js';

const router = express.Router();

// In a real SaaS, we would use a proper API key management system, or the users own key.
// Here we use the server's API key for demo purposes.
const geminiApiKey = process.env.GEMINI_API_KEY;

import fs from 'fs';
import path from 'path';

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', 'client', 'frontend', 'dist', 'build', 
  'out', 'coverage', '.next', '.cache', 'vendor', 'tmp'
]);
const EXCLUDED_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);
const ALLOWED_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.prisma', '.py', '.go', '.java', '.rb']);
const MAX_FILE_SIZE = 100 * 1024; // Skip files > 100KB
const MAX_TOTAL_CHARS = 50000; // Cap total context to save Gemini quota

function readDirectoryContext(dirPath, maxDepth = 3, currentDepth = 0, state = { totalChars: 0 }) {
  let context = '';
  if (currentDepth > maxDepth || state.totalChars >= MAX_TOTAL_CHARS) return context;
  
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (state.totalChars >= MAX_TOTAL_CHARS) break;
      if (EXCLUDED_DIRS.has(file)) continue;
      
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        context += readDirectoryContext(fullPath, maxDepth, currentDepth + 1, state);
      } else {
        if (EXCLUDED_FILES.has(file)) continue;
        
        const ext = path.extname(file).toLowerCase();
        
        if (ALLOWED_EXTENSIONS.has(ext)) {
          // Severely limit JSONs to just configs to prevent massive data dumps
          if (ext === '.json' && !file.includes('package') && !file.includes('config')) continue;
          
          if (stat.size > MAX_FILE_SIZE) continue; 

          const content = fs.readFileSync(fullPath, 'utf-8');
          // Clip individual files to 3000 characters to keep context broad but shallow
          const trimmedContent = content.length > 3000 ? content.substring(0, 3000) + '\n...[TRUNCATED FOR PAYLOAD DIET]' : content;
          
          const fileContext = `\n--- File: ${file} ---\n${trimmedContent}\n`;
          context += fileContext;
          state.totalChars += fileContext.length;
        }
      }
    }
  } catch (err) {
    console.error("Error reading dir:", err.message);
  }
  return context;
}

// POST /api/viva/start
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { codebaseContext, localPath, projectId } = req.body;
    
    let contextToUse = codebaseContext || '';
    if (localPath) {
      if (fs.existsSync(localPath)) {
        contextToUse = readDirectoryContext(localPath);
      } else {
        return res.status(400).json({ error: 'Local path does not exist' });
      }
    }

    if (!contextToUse || contextToUse.trim().length === 0) {
      return res.status(400).json({ error: 'Code context or valid localPath is required' });
    }

    const interviewer = new InterviewerAgent(geminiApiKey);
    const result = await interviewer.generateQuestion(contextToUse, []);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start viva session' });
  }
});

// POST /api/viva/evaluate
router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { codebaseContext, localPath, questions, answers, projectId } = req.body;

    let contextToUse = codebaseContext || '';
    if (localPath && fs.existsSync(localPath)) {
      contextToUse = readDirectoryContext(localPath);
    }

    if (!contextToUse || !questions || !answers || !projectId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const evaluator = new EvaluatorAgent(geminiApiKey);
    const evaluation = await evaluator.evaluateResponse(contextToUse, questions, answers);

    // Ensure the project exists in DB
    let project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          id: projectId,
          userId: req.user.user.id,
          name: localPath ? path.basename(localPath) : 'Viva Project',
          pathOrUrl: localPath || 'Code Context',
        }
      });
    }

    // Save to DB
    const vivaSession = await prisma.vivaSession.create({
      data: {
        projectId,
        score: evaluation.score,
        feedback: JSON.stringify(evaluation), // Store full JSON for UI
      }
    });

    res.json({ evaluation, sessionId: vivaSession.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to evaluate answers' });
  }
});

export default router;
