import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MemeForge-AI API' });
});

// Phase 2 Endpoints placeholder
app.post('/api/v1/auth/register', (req, res) => {
    res.status(501).json({ error: 'Not Implemented Yet' });
});

app.listen(port, () => {
  console.log(`Backend Server running on http://localhost:${port}`);
});
