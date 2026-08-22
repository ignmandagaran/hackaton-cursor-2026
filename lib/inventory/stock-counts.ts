import { and, desc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import { stockCounts } from "@/db/schema"
import { roundKg } from "@/lib/inventory/kg-tolerance"

type Executor = Pick<ReturnType<typeof getDb>, "insert">

export type StockCount = {
  id: number
  lotId: number
  locationId: number
  quantityKg: number
  countedAt: string
  notes: string | null
  createdAt: string
}

export function getLatestStockCount({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): StockCount | null {
  const db = getDb()

  const row = db
    .select()
    .from(stockCounts)
    .where(
      and(eq(stockCounts.lotId, lotId), eq(stockCounts.locationId, locationId))
    )
    .orderBy(desc(stockCounts.countedAt), desc(stockCounts.id))
    .limit(1)
    .get()

  if (!row) return null

  return {
    id: row.id,
    lotId: row.lotId,
    locationId: row.locationId,
    quantityKg: roundKg(row.quantityKg),
    countedAt: row.countedAt,
    notes: row.notes,
    createdAt: row.createdAt,
  }
}

export function createStockCount(
  {
    lotId,
    locationId,
    quantityKg,
    notes,
  }: {
    lotId: number
    locationId: number
    quantityKg: number
    notes?: string | undefined
  },
  executor: Executor = getDb()
): StockCount {
  const now = new Date().toISOString()

  const [row] = executor
    .insert(stockCounts)
    .values({
      lotId,
      locationId,
      quantityKg,
      countedAt: now,
      notes: notes ?? null,
      createdAt: now,
    })
    .returning()
    .all()

  if (!row) throw new Error("Failed to create stock count")

  return {
    id: row.id,
    lotId: row.lotId,
    locationId: row.locationId,
    quantityKg: roundKg(row.quantityKg),
    countedAt: row.countedAt,
    notes: row.notes,
    createdAt: row.createdAt,
  }
}
