# FinDev Tracker

> Command Center Tài Chính — Personal finance tracker with gamification, built for Vietnamese developers.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC)

## Features

- **Dashboard** — Net worth, income/expense charts, calendar heatmap, monthly bar chart
- **Transactions** — Track income, expenses, and transfers across accounts
- **Liabilities** — Manage credit cards, installments, and subscriptions with due dates
- **Investments** — Track stock fund goals and crypto holdings (BTC, ETH, SOL)
- **Achievements** — Gamified milestones (cash king 👑, coffee addict ☕, streak 🔥)
- **Settings** — Manage accounts, categories, and seed data

## Tech Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)          |
| Language        | TypeScript 5                                |
| ORM             | Prisma 7 (Client Engine)                    |
| DB (Local)      | SQLite via `@prisma/adapter-better-sqlite3` |
| DB (Production) | PostgreSQL on Vercel Postgres               |
| Styling         | TailwindCSS 4, custom dark theme            |
| Charts          | Recharts 3                                  |
| Icons           | Lucide React                                |
| UI Components   | Radix UI + Shadcn                           |
| Font            | IBM Plex Sans (Latin + Vietnamese)          |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Seed the database (optional, populates sample data)
npx tsx prisma/seed.ts

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
findevtracker/
├── prisma/
│   ├── schema.prisma       # Data models (7 models)
│   ├── seed.ts             # Sample data seeder
│   └── dev.db              # SQLite database (local)
├── prisma.config.ts        # Prisma config (datasource URL)
├── scripts/
│   └── switch-db.js        # Auto-switch SQLite ↔ PostgreSQL
├── src/
│   ├── app/
│   │   ├── page.tsx        # Dashboard
│   │   ├── transactions/   # Transaction list
│   │   ├── liabilities/    # Liability management
│   │   ├── investments/    # Investment tracking
│   │   ├── achievements/   # Gamification badges
│   │   ├── settings/       # App configuration
│   │   └── api/            # REST API routes
│   ├── components/
│   │   ├── charts/         # Recharts visualizations
│   │   ├── ui/             # Shadcn base components
│   │   └── *.tsx           # Feature components
│   ├── generated/prisma/   # Prisma generated client
│   └── lib/
│       ├── db.ts           # Prisma client singleton
│       ├── utils.ts        # Formatting helpers
│       └── period.ts       # Date period utilities
└── docs/
    ├── architecture.md     # System design & data models
    └── deployment.md       # Deployment guide
```

## Database Models

| Model           | Purpose                                              |
| --------------- | ---------------------------------------------------- |
| `Account`       | Bank, cash, credit, crypto, investment accounts      |
| `Category`      | Income/expense/transfer categories with groups       |
| `Transaction`   | Financial transactions linking accounts & categories |
| `Liability`     | Credit cards, installments, subscriptions            |
| `Goal`          | Financial targets with progress tracking             |
| `Achievement`   | Gamification badges and milestones                   |
| `CryptoHolding` | Cryptocurrency portfolio entries                     |

## Environment Variables

```env
# Required — SQLite path for local development
DATABASE_URL="file:./dev.db"

# Vercel deployment (set in Vercel dashboard)
POSTGRES_PRISMA_URL=       # Pooled Postgres URL
POSTGRES_URL_NON_POOLING=  # Direct Postgres URL
VERCEL=1                   # Auto-set by Vercel
```

## Documentation

- [Architecture Guide](docs/architecture.md) — System design, data models, and code organization
- [Deployment Guide](docs/deployment.md) — How to deploy to Vercel with PostgreSQL

## License

Private project.
