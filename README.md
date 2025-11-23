# Chubb

A Vite + React + TypeScript learning/quiz app scaffold using TailwindCSS, shadcn/ui components, and Supabase for backend data and auth. This README documents setup, development workflow, database migrations, seeding, and common tasks.

**Table of contents**

- **Project:** Short overview and intent
- **Tech Stack:** Libraries and services used
- **Repo Structure:** Important folders and files
- **Prerequisites:** Tools and environment
- **Quick Start:** Install, configure env, run locally
- **Database & Migrations:** How to apply SQL migrations
- **Seeding:** Generating and seeding question data (uses OpenAI)
- **Scripts:** Helpful `npm` / `bun` commands
- **Testing & Linting:** How to run checks
- **Deployment:** Notes and recommended steps
- **Contributing:** How to help
- **Troubleshooting:** Common issues and fixes

**Project**

- **Name:** `chubb`
- **Purpose:** Educational quiz platform prototype. Uses OpenAI to generate question content via a seeding script and Supabase for storing quizzes, questions and auth.

**Tech Stack**

- **Frontend:** Vite, React 18, TypeScript, TailwindCSS, shadcn/ui components
- **Backend / DB:** Supabase (Postgres + Auth)
- **Other:** OpenAI (used by seeding script), dotenv for local env

**Repo Structure (high level)**

- **`src/`**: Frontend source (pages, components, integrations)
- **`src/integrations/supabase/`**: Supabase client and types
- **`scripts/`**: Helper scripts (migrations, seeding)
- **`supabase/migrations/`**: Raw SQL migration files
- **`package.json`**: Scripts and dependencies

**Prerequisites**

- Node.js (v18+ recommended)
- npm, pnpm, or Bun (project includes a `bun.lockb` — Bun is supported but examples below use `npm`)
- A Supabase project (URL + anon key) and optionally a service role key for server tasks
- (For seeding) an OpenAI API key

**Environment variables**
Create a `.env` file in the project root with these variables (Vite expects `VITE_` prefix for browser-exposed values):

```
# Supabase (frontend/anonymous)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI (used only for seeding via server-side script)
OPENAI_API_KEY=sk-...

# (Optional) Service role key for certain server-side migration automation
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not commit `.env` to version control.

**Quick Start (local development)**

- Clone the repo

```
git clone https://github.com/harshit-senpai/chubb.git
cd chubb
```

- Install dependencies (npm example). If you use Bun: `bun install`.

```
npm install
# or
# bun install
```

- Run the dev server

```
npm run dev
# or with bun
# bun run dev
```

Open `http://localhost:5173` (Vite default) in your browser.

**Useful scripts** (from `package.json`)

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production bundle
- `npm run build:dev` — Build in development mode
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint
- `npm run seed:questions` — Generate & seed question data (calls `scripts/seed-questions.js`)

**Database & Migrations**

Migrations are placed under `supabase/migrations/` as SQL files. A small helper script is included at `scripts/run-migrations.js` which attempts to run a couple of SQL statements via Supabase RPC and the JS client.

Recommended steps to apply migrations:

1. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`.
2. If you prefer the Supabase CLI, use it to apply migrations (recommended for production): follow Supabase docs: https://supabase.com/docs/guides/cli
3. To run the included helper script locally:

```
node scripts/run-migrations.js
```

Note: `scripts/run-migrations.js` will try to run SQL via a stored RPC or fallback to instructing you to copy SQL to the Supabase dashboard if RPC isn't configured. If something fails, open the SQL files in `supabase/migrations/*.sql` and run them manually in the Supabase SQL editor.

**Seeding (generate question data)**

The seeding tool `scripts/seed-questions.js` uses the OpenAI API to create multiple-choice questions and then inserts them into Supabase. This script requires:

- `OPENAI_API_KEY` set in your `.env`
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in `.env`

Run it with:

```
npm run seed:questions
```

Important notes:

- The script will call the OpenAI API many times — monitor usage and billing.
- The script batches inserts and includes rate-limit handling, but you may still need to retry on network or API errors.

**Supabase client**

The front-end Supabase client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `src/integrations/supabase/client.ts`.

**Testing & Linting**

- Lint with ESLint:

```
npm run lint
```

There are no automated unit tests included by default. Consider adding testing frameworks (Vitest/Jest) if you plan to expand coverage.

**Deployment**

Frontend: build and deploy the `dist` folder produced by `npm run build`. Any static-hosting provider that supports single-page apps (Netlify, Vercel, Azure Static Web Apps, etc.) works.

Backend/DB: use Supabase (managed). For production environment variables, set keys securely in your host/provider (do not expose anon keys in public repos). Use service-role keys only on trusted server-side code.

**Recommended CI workflow (example)**

1. On push to `main` run `npm ci` and `npm run build`.
2. Run `npm run lint`.
3. Deploy build output to your chosen host and set production Supabase env variables in host settings.

**Contributing**

- Fork the repo, create a branch, open a PR with a clear description and screenshots if applicable.
- Keep changes focused: UI, features, bugfixes, or tests.

**Troubleshooting**

- Issue: `VITE_SUPABASE_ANON_KEY` missing
  - Ensure `.env` exists and you restarted the dev server after adding it.
- Issue: Seeding fails with OpenAI error
  - Verify `OPENAI_API_KEY` and your OpenAI account/billing
  - Check rate-limit responses and retry after backoff
- Issue: Migration errors
  - Open the SQL file under `supabase/migrations/` and run it manually in Supabase SQL editor

**Next steps / Suggestions**

- Add a `deploy` script and CI workflow (GitHub Actions) that runs build + deploy.
- Add automated tests (Vitest) and pre-commit hooks (husky) for linting.

---

If you want, I can also:

- Add a `README` badge for build/lint status
- Create a sample `.env.example` file
- Generate a minimal GitHub Actions workflow for build & deploy

---
