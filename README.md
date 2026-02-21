# CLOZR

External SaaS for product content optimization. Built as a Shopify-first platform that is future-platform-ready.

## What it does

CLOZR connects to a store, ingests product data, scores content quality, generates improvements, and helps publish optimized updates back to the platform.

## Why it matters

Most product catalogs are inconsistent and hard to maintain at scale. CLOZR treats product content like a system: structured schemas, repeatable scoring, auditable suggestions, and clear publish logs.

## Tech stack

- Next.js (App Router) + TypeScript
- Prisma (PostgreSQL recommended)
- Shopify integration (OAuth, webhooks, ingest, publish)
- Modular service layer for ingest, scan, optimize, publish

## Repo structure

- `app/`
  - Routes: marketing, auth, dashboard, connections, API
  - API namespaces: connections, ingest, scan, optimize, publish
- `src/core/`
  - Schema (CPS, agent catalog)
  - Scoring logic
  - Engine and utilities
- `src/connectors/`
  - Platform adapters
  - Shopify: OAuth, client, ingest, publish, webhooks
- `src/db/`
  - Prisma client and query helpers
- `src/server/services/`
  - `ingestService`, `scanService`, `optimizeService`, `publishService`
- `components/`
  - UI: ScoreCard, ProductTable, ConnectionCard, OptimizePanel
- `prisma/`
  - Models: Store, Product, Variant, Score, Suggestion, PublishLog

## Local setup

### 1) Install dependencies
```bash
npm install
