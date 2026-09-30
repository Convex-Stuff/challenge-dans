# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------
FROM oven/bun:1-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------------
# deps - install dependencies only, so this layer caches on lockfile changes.
# Scripts are ignored here because the `postinstall` hook (prisma generate)
# needs the schema, which is not copied at this stage.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

# ---------------------------------------------------------------------------
# builder - generate the Prisma client, then build Next.js.
#
# This stage runs on Node rather than Bun: the Bun build shipped in the Linux
# images is the "baseline" variant, and it segfaults part-way through
# `next build` (SIGILL). Dependencies are still resolved and installed by Bun
# in the `deps` stage above; Node only drives the build itself.
# ---------------------------------------------------------------------------
FROM node:24-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node node_modules/prisma/build/index.js generate
RUN node node_modules/next/dist/bin/next build

# ---------------------------------------------------------------------------
# migrator - one-shot container that applies pending migrations, then exits.
# docker-compose.prod.yml runs this before starting the app.
# ---------------------------------------------------------------------------
FROM base AS migrator
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock prisma.config.ts ./
COPY prisma ./prisma
CMD ["bunx", "prisma", "migrate", "deploy"]

# ---------------------------------------------------------------------------
# runner - minimal production image running the standalone server
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

USER bun
EXPOSE 3000
CMD ["bun", "server.js"]
