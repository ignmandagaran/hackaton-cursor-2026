import { and, asc, eq, isNotNull, isNull, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { locations, lots, movements, varieties } from "@/db/schema"

export type CurrentStock = {
  locationId: number
  locationName: string
  lots: {
    lotId: number
    lotCode: string
    varietyName: string
    quantityKg: number
  }[]
}

export function getLocationsWithLotStock(lotId: number): {
  locationId: number
  locationName: string
  quantityKg: number
}[] {
  const db = getDb()

  const allLocations = db
    .select()
    .from(locations)
    .orderBy(asc(locations.name))
    .all()

  return allLocations
    .map((location) => ({
      locationId: location.id,
      locationName: location.name,
      quantityKg: getAvailableStock({
        lotId,
        locationId: location.id,
      }),
    }))
    .filter((entry) => entry.quantityKg > 0)
}

export function getAvailableStock({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): number {
  const db = getDb()

  const incoming = db
    .select({
      total: sql<number>`coalesce(sum(${movements.quantityKg}), 0)`,
    })
    .from(movements)
    .where(
      and(
        eq(movements.lotId, lotId),
        eq(movements.destinationLocationId, locationId),
        isNull(movements.deletedAt)
      )
    )
    .get()

  const outgoing = db
    .select({
      total: sql<number>`coalesce(sum(${movements.quantityKg}), 0)`,
    })
    .from(movements)
    .where(
      and(
        eq(movements.lotId, lotId),
        eq(movements.originLocationId, locationId),
        isNotNull(movements.originLocationId),
        isNull(movements.deletedAt)
      )
    )
    .get()

  const incomingTotal = incoming?.total ?? 0
  const outgoingTotal = outgoing?.total ?? 0

  return Math.round((incomingTotal - outgoingTotal) * 100) / 100
}

export function getCurrentStock(): CurrentStock[] {
  const db = getDb()

  const allLocations = db
    .select()
    .from(locations)
    .orderBy(asc(locations.name))
    .all()

  const allLots = db
    .select({
      id: lots.id,
      code: lots.code,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .orderBy(asc(lots.code))
    .all()

  return allLocations
    .map((location) => ({
      locationId: location.id,
      locationName: location.name,
      lots: allLots
        .map((lot) => ({
          lotId: lot.id,
          lotCode: lot.code,
          varietyName: lot.varietyName,
          quantityKg: getAvailableStock({
            lotId: lot.id,
            locationId: location.id,
          }),
        }))
        .filter((lot) => lot.quantityKg !== 0),
    }))
    .filter((location) => location.lots.length > 0)
}
