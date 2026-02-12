# Clozr

External SaaS for product content optimization. Next.js App Router + TypeScript, Shopify-first and future-platform-ready.

## Structure

- `app/` — Routes: marketing, auth, dashboard, connections, API (connections, ingest, scan, optimize, publish)
- `src/core/` — Schema (CPS, agent catalog), scoring, engine, utils
- `src/connectors/` — Platform adapters (Shopify: OAuth, client, ingest, publish, webhooks)
- `src/db/` — Prisma client and queries
- `src/server/services/` — Ingest, scan, optimize, publish services
- `components/` — ScoreCard, ProductTable, ConnectionCard, OptimizePanel
- `prisma/` — Store, Product, Variant, Score, Suggestion, PublishLog

## Setup

1. `npm install`
2. Set `DATABASE_URL` and run `npx prisma generate` then `npx prisma migrate dev`
3. Configure Shopify app (client id, secret, scopes) for OAuth
4. `npm run dev` for local development

## Next steps checklist

- [ ] **Shopify OAuth** — Implement `api/connections/shopify/start` and `callback`, wire `src/connectors/shopify/oauth.ts`; add env `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_SCOPES`.
- [ ] **DB migrations** — Set `DATABASE_URL`, run `npx prisma migrate dev` and apply schema.
- [ ] **Ingest route** — Implement `api/ingest` to accept `storeId`, call `ingestService`, return sync result.
- [ ] **Session/auth** — Add session (e.g. NextAuth or cookies) and protect dashboard/API routes.
- [ ] **Scan & optimize** — Wire API routes to `scanService` and `optimizeService`; add LLM integration in `core/engine`.
