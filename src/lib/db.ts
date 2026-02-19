import { createRequire } from "module";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (process.env.VERCEL || process.env.POSTGRES_PRISMA_URL) {
    // Vercel / Production (Postgres)
    // Pass empty options to satisfy TS constructor signature
    return new PrismaClient({} as any);
  } else {
    // Local Development (SQLite)
    // Use createRequire to avoid loading better-sqlite3 in production if not needed
    const customRequire = createRequire(import.meta.url);

    const { PrismaBetterSqlite3 } = customRequire(
      "@prisma/adapter-better-sqlite3"
    );

    // Prisma 7: PrismaBetterSqlite3 is a factory that takes { url } config
    const url = process.env.DATABASE_URL || "file:./dev.db";
    const adapter = new PrismaBetterSqlite3({ url });

    return new PrismaClient({ adapter });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
