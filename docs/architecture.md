# Architecture

## Flow

```
Natural language input
       ↓
Gemini (structured extraction via Zod)
       ↓
Entity resolution (lots.code, locations + aliases)
       ↓
Stock calculation (ledger SUM)
       ↓
Validation (deterministic rules)
       ↓
Preview (no DB write)
       ↓
User confirmation
       ↓
TRANSFER insert + recalculated stock
```

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `components/movement/` | Operator input, preview, success/error |
| Actions | `lib/actions/movement.ts` | Server boundary for interpret + confirm |
| AI | `lib/ai/parse-movement.ts` | Gemini structured extraction only |
| Domain | `lib/inventory/` | Resolve, validate, stock, persist |
| Data | `db/` | Schema, migrations, seed |

## Stock ledger

```
stock(lot, location) =
  SUM(incoming to location) - SUM(outgoing from location)
```

Initial inventory enters as `INITIAL_BALANCE` movements (destination = location, origin = null).

## Safety

Interpret and Confirm are separate steps. The LLM never triggers an INSERT.

## Future (N02+)

The ledger design supports later discrepancy detection: expected stock from movements vs physical snapshots, with Gemini used only for explanation — not validation.
