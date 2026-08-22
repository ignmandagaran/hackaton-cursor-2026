import { asc, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { getDb } from "@/db"
import {
  locations,
  lots,
  movements,
  varieties,
  type MovementType,
} from "@/db/schema"
import { getAvailableStock } from "@/lib/inventory/stock"
import { getLotReconciliation } from "@/lib/inventory/reconciliation"

export type LotDetails = {
  id: number
  code: string
  variety: {
    id: number
    name: string
  }
  totalStockKg: number
  stockByLocation: {
    locationId: number
    locationName: string
    quantityKg: number
    expectedKg: number
    countedKg: number | null
    differenceKg: number | null
    status: "VERIFIED" | "DISCREPANCY" | "NOT_COUNTED"
  }[]
  recentMovements: {
    id: number
    createdAt: string
    quantityKg: number
    originName: string | null
    destinationName: string | null
    type: MovementType
  }[]
}

export function getLotDetails(lotId: number): LotDetails | null {
  const db = getDb()

  const lot = db
    .select({
      id: lots.id,
      code: lots.code,
      varietyId: varieties.id,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .where(eq(lots.id, lotId))
    .get()

  if (!lot) return null

  const allLocations = db
    .select()
    .from(locations)
    .orderBy(asc(locations.name))
    .all()

  const stockByLocation = allLocations
    .map((location) => ({
      locationId: location.id,
      locationName: location.name,
      quantityKg: getAvailableStock({
        lotId: lot.id,
        locationId: location.id,
      }),
    }))
    .filter((entry) => entry.quantityKg !== 0)

  const reconciliation = getLotReconciliation(lotId)
  const reconciliationByLocation = new Map(
    reconciliation.map((entry) => [entry.locationId, entry])
  )

  const stockByLocationWithReconciliation = stockByLocation.map((entry) => {
    const rec = reconciliationByLocation.get(entry.locationId)
    return {
      ...entry,
      expectedKg: rec?.expectedKg ?? entry.quantityKg,
      countedKg: rec?.countedKg ?? null,
      differenceKg: rec?.differenceKg ?? null,
      status: rec?.status ?? "NOT_COUNTED",
    }
  })

  const totalStockKg = Math.round(
    stockByLocation.reduce((sum, entry) => sum + entry.quantityKg, 0) * 100
  ) / 100

  const originLocation = alias(locations, "origin_location")
  const destinationLocation = alias(locations, "destination_location")

  const recentMovements = db
    .select({
      id: movements.id,
      createdAt: movements.createdAt,
      quantityKg: movements.quantityKg,
      originName: originLocation.name,
      destinationName: destinationLocation.name,
      type: movements.type,
    })
    .from(movements)
    .leftJoin(originLocation, eq(movements.originLocationId, originLocation.id))
    .leftJoin(
      destinationLocation,
      eq(movements.destinationLocationId, destinationLocation.id)
    )
    .where(eq(movements.lotId, lotId))
    .orderBy(desc(movements.createdAt), desc(movements.id))
    .limit(5)
    .all()

  return {
    id: lot.id,
    code: lot.code,
    variety: {
      id: lot.varietyId,
      name: lot.varietyName,
    },
    totalStockKg,
    stockByLocation: stockByLocationWithReconciliation,
    recentMovements,
  }
}
