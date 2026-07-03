import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// 1. Set up the Postgres connection pool
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 2. Wrap it in the Prisma 7 Adapter
const adapter = new PrismaPg(pool);

// 3. Initialize the client with the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;