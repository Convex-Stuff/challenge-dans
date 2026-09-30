import "server-only";

import { prisma } from "@/lib/prisma";

export type HealthStatus = {
  database: "ok" | "unreachable";
};

/** Whether the app can reach Postgres, for the deploy's health check. */
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { database: "ok" };
  } catch {
    return { database: "unreachable" };
  }
}
