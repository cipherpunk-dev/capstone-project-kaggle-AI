import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    if (email === 'admin@viva.com') {
      return res.status(403).json({ error: 'Cannot register with admin email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: 'user' } });
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Hardcoded Admin Logic
    if (email === 'admin@viva.com' && password === 'admin123') {
      const payload = {
        user: {
          id: 'admin',
          role: 'admin'
        }
      };
      
      return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '5d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, user: { id: 'admin', email: 'admin@viva.com', role: 'admin' } });
        }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: 'user'
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email, role: 'user' } });
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

export default router;
