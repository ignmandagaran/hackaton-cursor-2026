# Papasud — Stock Movements (N01)

MVP for **Vertical 3 — Stock, traceability and compliance**: register seed-potato stock transfers using natural language, with deterministic inventory validation.

## Problem

Papasud manages distributed inventory (~150 lots across 4 locations) via spreadsheets edited by multiple people, causing version conflicts, poor traceability, and late-discovered discrepancies.

## MVP

An operator describes a transfer in Spanish (e.g. *"Mové 500 kg del lote 224 del Frigorífico 1 al Galpón"*). Gemini extracts structured fields; SQLite remains the source of truth for stock, entities, and validation. The user previews and explicitly confirms before any write.

## Architecture

```
Next.js (App Router) + TypeScript
SQLite (better-sqlite3) + Drizzle ORM
Gemini via Vercel AI SDK (@ai-sdk/google)
```

Stock is derived from a **movement ledger** (`INITIAL_BALANCE`, `TRANSFER`) — no mutable `current_stock` column.

## AI responsibility

Gemini interprets language only. It never decides stock levels, lot existence, or location validity.

## Running locally

```bash
bun install
cp .env.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY to .env.local
bun run db:migrate
bun run db:seed
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo acceptance scenario

1. Seed: Lot 224 has 1,240 kg at Frigorífico 1
2. Enter: `Mové 500 kg del lote 224 del Frigorífico 1 al Galpón`
3. Click **Interpretar** → preview shows 740 kg remaining
4. Click **Confirmar movimiento** → transfer persisted
5. Try moving 1,000 kg from the same lot → rejected (740 kg available)

## Important assumption

The official names of the 3 cold-storage facilities + 1 warehouse are **not** conclusively mapped from the supplied spreadsheet. The MVP uses demo labels: Frigorífico 1/2/3 and Galpón.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:seed` | Load demo data |
| `bun run dev` | Start dev server |
