# challenge-dans

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, with PostgreSQL accessed
through Prisma 7. Bun is the package manager and runtime. Served at
[dans.convex.coffee](https://dans.convex.coffee).

## Local development

Postgres runs in Docker; the Next.js dev server runs on the host.

```bash
cp .env.example .env   # then set POSTGRES_PASSWORD / DATABASE_URL
bun install
bun run db:up          # start Postgres (docker-compose.yml)
bun run db:migrate     # apply migrations
bun run dev            # http://localhost:3000
```

`GET /api/health` returns `{"database":"ok"}` (200) when the app can reach
Postgres, and 503 otherwise.

## UI

Components come from [shadcn/ui](https://ui.shadcn.com) (`base-mira` style,
on Base UI) and live in [`src/components/ui/`](src/components/ui). Add more
with:

```bash
bunx --bun shadcn@latest add <component>
```

Site name and navigation are in [`src/config/site.ts`](src/config/site.ts);
the palette for both themes is in [`src/app/globals.css`](src/app/globals.css).
Conventions for agents and contributors, including the vendored shadcn and
Prisma skills, are in [`AGENTS.md`](AGENTS.md).

## Authentication (osu!)

Sign-in uses [Auth.js](https://authjs.dev) (`next-auth` v5) with its built-in
osu! OAuth provider, backed by database sessions in Postgres.

### One-time setup

osu! allows only one callback URL per OAuth application, so local and
production need **separate applications**. Register them at
[osu! account settings](https://osu.ppy.sh/home/account/edit#new-oauth-application).

| | Callback URL | Credentials live in |
| --- | --- | --- |
| Local | `http://localhost:3000/api/auth/callback/osu` | `.env` |
| Production | `https://dans.convex.coffee/api/auth/callback/osu` | repository secrets |

Copy each application's client ID and secret into `AUTH_OSU_ID` and
`AUTH_OSU_SECRET` for its environment, and set `AUTH_SECRET`
(`openssl rand -base64 32`) - a different value in each.

Mixing the pair - one application's id with another's secret - fails at the
token exchange with `invalid_client`, after the osu! consent screen.

### How it works

`signIn("osu")` redirects to osu!, which returns to
`/api/auth/callback/osu`. The Prisma adapter then creates a `User` row plus a
linked `Account` row (`provider = "osu"`, `providerAccountId` = the osu! user
id) and opens a `Session`. Returning users are matched on that `Account` pair,
so they get the same `User` every time.

osu! does not expose an email address, so `User.email` is nullable and stays
`null`. Identity is carried by `User.osuId` (unique) and `User.osuUsername`,
which are refreshed, with the avatar, on every sign-in.

Pages and actions read the signed-in player through the data layer:

```ts
import { getCurrentUser, requireUser } from "@/lib/data/session";

const viewer = await getCurrentUser(); // Viewer | null
const player = await requireUser();    // throws UnauthorizedError if signed out
```

Config lives in [`src/auth.ts`](src/auth.ts); the route handler is
[`src/app/api/auth/[...nextauth]/route.ts`](src/app/api/auth/%5B...nextauth%5D/route.ts).
The header's Sign in button and avatar menu use the shared server actions in
[`src/lib/auth-actions.ts`](src/lib/auth-actions.ts).

## Database

Models live in [`prisma/schema.prisma`](prisma/schema.prisma); so far only
the Auth.js models sign-in needs. The generated client is written to `src/generated/prisma` and is
gitignored — `bun install` regenerates it via the `postinstall` hook.

Pages and actions read the database through the data layer in
[`src/lib/data/`](src/lib/data), which imports the shared client from
[`src/lib/prisma.ts`](src/lib/prisma.ts) (see `AGENTS.md`).

| Script | Purpose |
| --- | --- |
| `bun run db:up` / `db:down` | Start / stop the Postgres container |
| `bun run db:migrate` | Create and apply a migration (development) |
| `bun run db:deploy` | Apply pending migrations (production) |
| `bun run db:generate` | Regenerate the Prisma client |
| `bun run db:studio` | Open Prisma Studio |
| `bun run db:reset` | Drop and recreate the database |

Prisma 7 requires a driver adapter; this project uses `@prisma/adapter-pg`.
Connection details are read from `DATABASE_URL` (see `prisma.config.ts`).

## Deployment

Both the app and the database run in containers. Migrations are applied by a
one-shot `migrate` service that must exit successfully before the app starts.

```bash
POSTGRES_USER=dans POSTGRES_DB=dans POSTGRES_PASSWORD=... AUTH_SECRET=... AUTH_OSU_ID=... AUTH_OSU_SECRET=... AUTH_URL=https://dans.convex.coffee docker compose -f docker-compose.prod.yml up -d --build
```

Every one of these variables is required; compose fails fast with a message
if any is missing.

The image is built from [`Dockerfile`](Dockerfile) and serves Next.js in
`standalone` mode. Bun installs dependencies and runs the server; the
`next build` step runs under Node, because the Linux (baseline) Bun build
segfaults part-way through the build.

### Deploy workflow

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on push to
`main`: it builds the `runner` and `migrator` images, pushes them to Docker
Hub, joins the tailnet, copies `docker-compose.prod.yml` to the box and
starts the stack. It needs these repository settings:

| Name | Kind | Purpose |
| --- | --- | --- |
| `DOCKER_USERNAME` / `DOCKER_PASSWORD` | secret | Docker Hub push |
| `TS_OAUTH_CLIENT_ID` / `TS_AUDIENCE` | secret | Join the tailnet (`tag:ci`) |
| `SSH_HOST` | secret | The box's tailnet address |
| `SSH_USERNAME` / `SSH_KEY` | secret | SSH login on the box |
| `SSH_HOST_FINGERPRINT` | secret | The box's ECDSA host key fingerprint |
| `POSTGRES_PASSWORD` | secret | Database password |
| `AUTH_SECRET` | secret | Auth.js signing secret (`openssl rand -base64 32`) |
| `AUTH_OSU_ID` / `AUTH_OSU_SECRET` | secret | The production osu! OAuth application |
| `AUTH_URL` | variable, optional | Public origin, default `https://dans.convex.coffee` |
| `SITE_NAME` | variable, optional | Image name, default `challenge-dans` |
| `DEPLOY_PATH` | variable, optional | Stack directory on the box, default `apps/challenge-dans` |
| `POSTGRES_USER` / `POSTGRES_DB` | variable, optional | Both default to `dans`; fixed once the volume is created |

### TLS and the domain

The stack publishes no ports. The box's shared Caddy, in `convex-infra`
(`caddy/`), terminates TLS for every site on it and reaches this app as
`dans-app` on the external `edge` network. `dans.convex.coffee` is proxied by
Cloudflare, so Caddy presents a Cloudflare Origin Certificate rather than
using ACME, which cannot complete through Cloudflare's proxy. Setting that up
happens in `convex-infra`:

1. In Cloudflare, add a proxied DNS record for `dans` in the `convex.coffee`
   zone pointing at the box. The zone's SSL/TLS mode should be Full (strict).
2. The certificate is the zone's wildcard (`*.convex.coffee`), shared with
   every other `convex.coffee` site and stored in `convex-infra`'s secrets as
   `CONVEX_COFFEE_ORIGIN_CERT` / `CONVEX_COFFEE_ORIGIN_KEY`. Nothing to create.
3. `caddy/site/Caddyfile` has a `dans.convex.coffee` block proxying to
   `dans-app:3000` with that certificate.
