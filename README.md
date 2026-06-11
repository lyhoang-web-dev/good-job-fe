# Good Job — Frontend

React web app (Vite, TypeScript, Chakra UI v3, TanStack Router & Query) for an internal recognition and rewards program.

## Environment requirements

- **Node.js** `^24.11.x` (use the exact version declared in `package.json` → `engines` to avoid warnings when installing packages)
- **pnpm** `10.24.0` (declared in `packageManager`; enable it via `corepack enable`)

## Install and run locally

```bash
git clone <repo-url>
cd good-job-fe

# Install dependencies (Vite is invoked through the `vp` CLI in the npm scripts)
pnpm install

# Create the dev env file (details below)
cp .env.example .env.local

# Start the dev server (usually http://localhost:3000 — check the terminal)
pnpm dev
```

## Environment variables

Vite only reads variables prefixed with `VITE_`, at **build time** and **during dev**.

| Variable | Description |
|------|--------|
| `VITE_API_URL` | API base URL (e.g. `http://localhost:4000/api`, or `/api` if you use a dev proxy). See `.env.example`. |

Copy `.env.example` → `.env.local`, then adjust the values for your environment. `.env*` files (except `.env.example`) are not committed.

## Common commands

| Command | Description |
|------|--------|
| `pnpm dev` | Dev server (Vite) |
| `pnpm build` | Production build → `dist/` directory |
| `pnpm serve` | Preview the build (`vp preview`) |
| `pnpm type:check` | TypeScript check |
| `pnpm test` | Run all tests (Vitest via Vite) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm ultracite:check` | Lint + format check (Biome / Ultracite) |
| `pnpm ultracite:fix` | Auto-fix the format/lint issues that can be fixed |
| `pnpm check:turbo` | Run in parallel: ultracite + typecheck + test (used in CI / the push hook) |

## Before commit / push

The project can run checks equivalent to CI:

```bash
pnpm check:turbo
```

Commit messages follow **Conventional Commits** (e.g. `fix: description`, `feat: description`) to pass commitlint.

## Build & deploy

- **Vercel**: `vercel.json` is included (SPA rewrite + build). In the Vercel dashboard, set `VITE_API_URL`, then **redeploy** after changing env vars.
- **Docker**: see `Dockerfile` and `docker-compose.yml` — pass `VITE_API_URL` via `--build-arg` when running `docker build`, because the value is embedded into the bundle at build time.

## Further documentation in this repo

- `docs/AI_AUTH_HANDOFF.md` — **auth, axios, SSE, OAuth**: the BE/FE contract and invariants that must not be broken (read before touching login/API/SSE).
- `AGENTS.md` / `CLAUDE.md` — code-structure guidance for agents/IDEs (if present in your clone).
