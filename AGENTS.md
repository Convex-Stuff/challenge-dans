<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

## Bun, not npm

Bun is the package manager and runtime. Use `bun` / `bunx`, never `npm`,
`npx`, `yarn` or `pnpm` — including when following instructions from a
vendored skill or upstream documentation that says `npx`. Translate those to
`bunx` (`npx shadcn@latest add button` becomes `bunx shadcn@latest add
button`).

The one deliberate exception is inside `Dockerfile`, where the `builder` stage
runs `next build` under Node: the Linux Bun builds segfault part-way through
that build. Bun still installs dependencies and runs the production server.

## Deployment

`docker-compose.prod.yml` is deployed by `.github/workflows/deploy.yml` on
push to `main`. Every variable the compose file marks required (`${VAR:?}`)
must also be written to `.env` by that workflow's deploy script — adding one
without the other breaks the deploy on the box, where the failure is slow to
diagnose.

This stack serves no ports. The box runs other sites too, each in its own
compose stack, and TLS for all of them is terminated by one Caddy, which lives
in the `convex-infra` repo (`caddy/`) along with the Cloudflare Origin
Certificates it presents. It reaches this app as `dans-app` over `edge`, a
Docker network external to every project that the deploy script creates if it
is missing. Changing the domain (dans.convex.coffee) or the proxy is done
there, not here, and so is the box's firewall, which only admits Cloudflare:
the site is unreachable unless Cloudflare proxies it.

## UI: shadcn

UI is built from shadcn components (`base-mira` style, on Base UI), vendored
into `src/components/ui/` and configured by `components.json`. Follow the
vendored skill in `.claude/skills/shadcn/` (pinned in `skills-lock.json`):

- Use an existing component before writing custom markup: `Empty` (through
  `EmptyState`) for empty lists, `Alert` for callouts, `Badge` rather than
  styled spans, `Separator` rather than borders, `Spinner` for pending
  buttons.
- Style with semantic tokens (`bg-background`, `text-muted-foreground`),
  never raw colours or `dark:` overrides; the palette lives in
  `src/app/globals.css`, for both themes.
- Custom triggers use Base UI's `render` prop, not Radix's `asChild`.
- Add components with `bunx --bun shadcn@latest add <name>`, and read what it
  wrote before using it.

Pages go in `PageShell` (title, description, content width). The header
renders the navigation in `src/config/site.ts`: adding a page means adding an
entry there and creating the route.

The theme is the `dark` class on `<html>`, dark by default; `src/lib/theme.ts`
applies a saved choice before the first paint.

## Typography

Text uses Saira (`font-sans`, the default). Headings and titles use
`font-heading`, which is Saira too for now, so a display font can be dropped
in later by changing `--font-heading` in `globals.css` alone.

## Errors

Errors the app throws on purpose are classes in `src/lib/errors.ts`, all
extending `AppError`, which carries the HTTP status to answer with:
`NotFoundError`, `UnauthorizedError`, `ForbiddenError` and `ValidationError`
(a message per field, for forms). Throw these from the data layer rather than
bare `Error`s, and branch on them with `instanceof`, not on messages. Their
messages are shown to users, so keep anything sensitive out of them. The
module is client-safe.

Classes are for things with state or identity, such as these errors and
clients for external services. The data layer itself stays plain functions
(below), which is what Next's Data Access Layer pattern and React's `cache()`
expect.

## Data access

All database access goes through `src/lib/data/`, following Next's Data
Access Layer pattern (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`):

- Every module starts with `import "server-only"`, so importing one into a
  Client Component fails the build.
- Functions return small DTO types, never raw Prisma rows, so a result can be
  passed to any component without leaking fields.
- Authorization happens inside the data layer, not only in pages: a
  page-level check does not protect the server actions on it. Refuse with
  `UnauthorizedError` / `ForbiddenError`, and report a missing record with
  `NotFoundError`.
- `"use server"` actions stay thin and delegate here.

Nothing outside `src/lib/data/` imports `@/lib/prisma`. Standalone bun scripts
can't import the data layer, since `server-only` fails outside Next, so they
import `@/lib/prisma` directly.
