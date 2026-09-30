import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

type Client = PrismaClient;

const createPrismaClient = (): Client => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
};

// Next.js clears the module registry on every hot reload in development, which
// would otherwise open a new connection pool per reload. Cache the client on
// globalThis so reloads reuse the same instance.
const globalForPrisma = globalThis as unknown as { prisma?: Client };

const getClient = (): Client => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
};

// The client is created on first use rather than at import time. `next build`
// imports every route's module graph to collect page data, and the build
// environment has no DATABASE_URL - constructing eagerly would fail the build.
export const prisma = new Proxy({} as Client, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
  has(_target, property) {
    return property in getClient();
  },
});
