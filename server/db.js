import { PrismaClient } from '@prisma/client';

// Singleton pattern: prevents multiple connection pool instances
// across controllers and middlewares
const prisma = new PrismaClient();

export default prisma;
