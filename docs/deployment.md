# Deployment Guide

## Prerequisites

- A [Vercel](https://vercel.com) account
- A GitHub/GitLab repository with the project code
- Node.js 18+ installed locally

---

## Deploy to Vercel (Recommended)

### 1. Create a Vercel Postgres Database

1. Go to **Vercel Dashboard** → **Storage** → **Create Database**
2. Select **Postgres** → **Create**
3. Copy the connection strings — Vercel auto-populates them as environment variables

### 2. Set Environment Variables

In Vercel project settings (**Settings** → **Environment Variables**), ensure these are set:

| Variable                   | Value                           | Notes                                           |
| -------------------------- | ------------------------------- | ----------------------------------------------- |
| `POSTGRES_PRISMA_URL`      | `postgres://...?pgbouncer=true` | Pooled connection (auto-set by Vercel Postgres) |
| `POSTGRES_URL_NON_POOLING` | `postgres://...`                | Direct connection for migrations (auto-set)     |

> **Note**: `VERCEL=1` is automatically set by the Vercel platform. The app uses this to detect the production environment.

### 3. Configure the Build

The `postinstall` script handles schema switching automatically:

```json
{
  "scripts": {
    "postinstall": "node scripts/switch-db.js auto && prisma generate"
  }
}
```

On Vercel, `postinstall` runs during the build. The `switch-db.js` script detects the `VERCEL` env var and switches `schema.prisma` from SQLite to PostgreSQL.

### 4. Deploy

```bash
# Option A: Connect repo to Vercel (recommended)
# Push to main branch → Vercel auto-deploys

# Option B: Manual deploy
npx vercel
```

### 5. Run Migrations on Vercel Postgres

After the first deploy, run migrations to create the database tables:

```bash
# Switch schema to Postgres locally
node scripts/switch-db.js postgres

# Run migrations against Vercel Postgres
# Set the env vars first:
export POSTGRES_PRISMA_URL="your-pooled-url"
export POSTGRES_URL_NON_POOLING="your-direct-url"

npx prisma migrate dev --name init

# Switch back to SQLite for local dev
node scripts/switch-db.js sqlite
```

### 6. Seed Production Data (Optional)

```bash
# With Postgres env vars set:
npx tsx prisma/seed.ts
```

---

## Local Development

### SQLite (Default)

```bash
npm install       # Runs postinstall → switch-db auto → prisma generate
npm run dev       # Starts Next.js with Turbopack on localhost:3000
```

The app uses `file:./dev.db` (SQLite) by default when no Vercel env vars are detected.

### Prisma Studio

```bash
npx prisma studio   # Opens DB browser at localhost:5555
```

### Reset Database

```bash
rm dev.db prisma/dev.db           # Delete existing DB
npx tsx prisma/seed.ts            # Re-seed with sample data
```

---

## How the Dual DB Strategy Works

```
┌─────────────────────────────────────────────────┐
│                  npm install                     │
│                     │                            │
│          ┌──────────▼──────────┐                 │
│          │  switch-db.js auto  │                 │
│          └──────────┬──────────┘                 │
│                     │                            │
│     ┌───────────────┴───────────────┐            │
│     ▼                               ▼            │
│  VERCEL env?                    No VERCEL env    │
│  ┌──────────────┐               ┌────────────┐  │
│  │ → PostgreSQL │               │ → SQLite   │  │
│  │   schema     │               │   schema   │  │
│  └──────────────┘               └────────────┘  │
│                                                  │
│          prisma generate                         │
│          (generates client)                      │
└─────────────────────────────────────────────────┘
```

At **runtime**, `src/lib/db.ts` also checks the environment:
- **Vercel**: `new PrismaClient({} as any)` — standard Postgres connection
- **Local**: `new PrismaClient({ adapter })` — SQLite via driver adapter

---

## Troubleshooting

### "Expected 1 arguments, but got 0" (TypeScript)

The Prisma 7 generated client requires either an `adapter` or `accelerateUrl` argument. The production path uses `{} as any` to bypass this since Postgres connects through the standard engine.

### "Cannot read properties of undefined (reading 'replace')"

The `PrismaBetterSqlite3` adapter needs a `{ url }` config object:
```typescript
// ✅ Correct (Prisma 7)
new PrismaBetterSqlite3({ url: "file:./dev.db" })

// ❌ Wrong (Prisma 6 pattern)
const db = new Database("./dev.db");
new PrismaBetterSqlite3(db)
```

### Schema out of sync

```bash
node scripts/switch-db.js sqlite   # Force SQLite
npx prisma generate                # Regenerate client
```
