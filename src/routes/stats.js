import express from 'express';
import prisma from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user.id;

    // Fetch projects for the user
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        vivaSessions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const stats = {
      totalProjects: projects.length,
      totalSessions: 0,
      averageScore: 0,
      projectsData: projects,
    };

    let totalScore = 0;
    projects.forEach((project) => {
      stats.totalSessions += project.vivaSessions.length;
      project.vivaSessions.forEach((session) => {
        totalScore += session.score;
      });
    });

    if (stats.totalSessions > 0) {
      stats.averageScore = totalScore / stats.totalSessions;
    }

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;
