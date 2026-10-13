import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prefer DIRECT_URL (port 5432 direct connection) over pooled DATABASE_URL if provided,
// particularly for environments where port 6543 is firewalled.
const datasourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl ? datasourceUrl : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Executes a database query with a timeout. If the database connection is hung or takes
 * longer than timeoutMs, falls back gracefully or rejects with a clean error.
 */
export async function withDbTimeout<T>(
  queryFn: () => Promise<T>,
  timeoutMs = 2500,
  fallbackVal?: T
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Database query timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([queryFn(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (fallbackVal !== undefined) {
      return fallbackVal;
    }
    throw err;
  }
}

