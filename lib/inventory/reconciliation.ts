import { and, asc, desc, eq, or } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { getDb } from "@/db"
import {
  locations,
  lots,
  movements,
  varieties,
  type MovementType,
} from "@/db/schema"
import { kgEqual, roundKg } from "@/lib/inventory/kg-tolerance"
import { getLatestStockCount } from "@/lib/inventory/stock-counts"
import { getAvailableStock } from "@/lib/inventory/stock"

export type ReconciliationStatus = "VERIFIED" | "DISCREPANCY" | "NOT_COUNTED"

export type StockReconciliation = {
  lotId: number
  lotCode: string
  varietyName: string
  locationId: number
  locationName: string
  expectedKg: number
  countedKg: number | null
  countedAt: string | null
  differenceKg: number | null
  status: ReconciliationStatus
}

export type ReconciliationSummary = {
  totalExpectedKg: number
  verifiedKg: number
  notCountedKg: number
  discrepancyCount: number
}

export type DiscrepancyEvidence = {
  lotId: number
  lotCode: string
  varietyName: string
  locationId: number
  locationName: string
  expectedKg: number
  countedKg: number
  differenceKg: number
  movements: {
    id: number
    createdAt: string
    quantityKg: number
    originName: string | null
    destinationName: string | null
    type: MovementType
  }[]
}

function deriveStatus(
  expectedKg: number,
  countedKg: number | null
): Pick<StockReconciliation, "status" | "differenceKg"> {
  if (countedKg === null) {
    return { status: "NOT_COUNTED", differenceKg: null }
  }

  const differenceKg = roundKg(countedKg - expectedKg)

  if (kgEqual(expectedKg, countedKg)) {
    return { status: "VERIFIED", differenceKg: 0 }
  }

  return { status: "DISCREPANCY", differenceKg }
}

export function getStockReconciliation(): StockReconciliation[] {
  const db = getDb()

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

  const allLocations = db
    .select()
    .from(locations)
    .orderBy(asc(locations.name))
    .all()

  const results: StockReconciliation[] = []

  for (const lot of allLots) {
    for (const location of allLocations) {
      const expectedKg = getAvailableStock({
        lotId: lot.id,
        locationId: location.id,
      })

      if (expectedKg === 0) continue

      const latestCount = getLatestStockCount({
        lotId: lot.id,
        locationId: location.id,
      })

      const countedKg = latestCount ? latestCount.quantityKg : null
      const { status, differenceKg } = deriveStatus(expectedKg, countedKg)

      results.push({
        lotId: lot.id,
        lotCode: lot.code,
        varietyName: lot.varietyName,
        locationId: location.id,
        locationName: location.name,
        expectedKg,
        countedKg,
        countedAt: latestCount?.countedAt ?? null,
        differenceKg,
        status,
      })
    }
  }

  return results
}

export function getLotReconciliation(lotId: number): StockReconciliation[] {
  return getStockReconciliation().filter((entry) => entry.lotId === lotId)
}

export function getReconciliationSummary(): ReconciliationSummary {
  const entries = getStockReconciliation()

  let totalExpectedKg = 0
  let verifiedKg = 0
  let notCountedKg = 0
  let discrepancyCount = 0

  for (const entry of entries) {
    totalExpectedKg += entry.expectedKg

    if (entry.status === "VERIFIED") {
      verifiedKg += entry.expectedKg
    } else if (entry.status === "NOT_COUNTED") {
      notCountedKg += entry.expectedKg
    } else if (entry.status === "DISCREPANCY") {
      discrepancyCount += 1
    }
  }

  return {
    totalExpectedKg: roundKg(totalExpectedKg),
    verifiedKg: roundKg(verifiedKg),
    notCountedKg: roundKg(notCountedKg),
    discrepancyCount,
  }
}

export function getLocationReconciliationSummary(): {
  locationId: number
  locationName: string
  totalKg: number
  verifiedCount: number
  discrepancyCount: number
  notCountedCount: number
}[] {
  const entries = getStockReconciliation()
  const byLocation = new Map<
    number,
    {
      locationId: number
      locationName: string
      totalKg: number
      verifiedCount: number
      discrepancyCount: number
      notCountedCount: number
    }
  >()

  for (const entry of entries) {
    const existing = byLocation.get(entry.locationId) ?? {
      locationId: entry.locationId,
      locationName: entry.locationName,
      totalKg: 0,
      verifiedCount: 0,
      discrepancyCount: 0,
      notCountedCount: 0,
    }

    existing.totalKg = roundKg(existing.totalKg + entry.expectedKg)

    if (entry.status === "VERIFIED") existing.verifiedCount += 1
    else if (entry.status === "DISCREPANCY") existing.discrepancyCount += 1
    else existing.notCountedCount += 1

    byLocation.set(entry.locationId, existing)
  }

  return [...byLocation.values()].sort((a, b) =>
    a.locationName.localeCompare(b.locationName)
  )
}

export function getDiscrepancyEvidence({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): DiscrepancyEvidence | null {
  const db = getDb()
  const entry = getStockReconciliation().find(
    (row) => row.lotId === lotId && row.locationId === locationId
  )

  if (!entry || entry.status !== "DISCREPANCY" || entry.countedKg === null) {
    return null
  }

  const originLocation = alias(locations, "origin_location")
  const destinationLocation = alias(locations, "destination_location")

  const relevantMovements = db
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
    .where(
      and(
        eq(movements.lotId, lotId),
        or(
          eq(movements.originLocationId, locationId),
          eq(movements.destinationLocationId, locationId)
        )
      )
    )
    .orderBy(desc(movements.createdAt), desc(movements.id))
    .limit(15)
    .all()

  return {
    lotId: entry.lotId,
    lotCode: entry.lotCode,
    varietyName: entry.varietyName,
    locationId: entry.locationId,
    locationName: entry.locationName,
    expectedKg: entry.expectedKg,
    countedKg: entry.countedKg,
    differenceKg: entry.differenceKg ?? 0,
    movements: relevantMovements,
  }
}

export function getReconciliationEntry({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): StockReconciliation | null {
  return (
    getStockReconciliation().find(
      (row) => row.lotId === lotId && row.locationId === locationId
    ) ?? null
  )
}
