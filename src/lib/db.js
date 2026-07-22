import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

let prisma;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.globalPrisma) {
    const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
    global.globalPrisma = new PrismaClient({ adapter });
  }
  prisma = global.globalPrisma;
}

export const db = prisma;
