import { and, asc, eq, isNull } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { getDb } from "@/db"
import {
  locations,
  lots,
  movements,
  varieties,
  type MovementType,
} from "@/db/schema"
import { roundKg } from "@/lib/inventory/kg-tolerance"

export type LotHistoryOption = {
  id: number
  code: string
  varietyName: string
}

export type StockHistoryLocation = {
  locationId: number
  locationName: string
}

export type StockHistoryBalance = {
  locationId: number
  locationName: string
  quantityKg: number
}

export type StockHistoryPoint = {
  timestamp: string
  movementId: number
  movementType: MovementType
  quantityKg: number
  originName: string | null
  destinationName: string | null
  balances: StockHistoryBalance[]
}

export type LotStockHistory = {
  lotId: number
  lotCode: string
  varietyName: string
  locations: StockHistoryLocation[]
  points: StockHistoryPoint[]
}

export type LedgerMovement = {
  id: number
  createdAt: string
  type: MovementType
  quantityKg: number
  originLocationId: number | null
  destinationLocationId: number | null
  originName: string | null
  destinationName: string | null
}

export function getLotHistoryOptions(): LotHistoryOption[] {
  const db = getDb()

  return db
    .select({
      id: lots.id,
      code: lots.code,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .orderBy(asc(lots.code))
    .all()
}

export function getDefaultStockHistoryLotId(
  options: LotHistoryOption[]
): number | null {
  const preferred = options.find((lot) => lot.code === "224")
  return preferred?.id ?? options[0]?.id ?? null
}

export function getLotStockHistory(lotId: number): LotStockHistory | null {
  const db = getDb()

  const lot = db
    .select({
      id: lots.id,
      code: lots.code,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .where(eq(lots.id, lotId))
    .get()

  if (!lot) return null

  const originLocation = alias(locations, "origin_location")
  const destinationLocation = alias(locations, "destination_location")

  const ledgerMovements = db
    .select({
      id: movements.id,
      createdAt: movements.createdAt,
      type: movements.type,
      quantityKg: movements.quantityKg,
      originLocationId: movements.originLocationId,
      destinationLocationId: movements.destinationLocationId,
      originName: originLocation.name,
      destinationName: destinationLocation.name,
    })
    .from(movements)
    .leftJoin(originLocation, eq(movements.originLocationId, originLocation.id))
    .leftJoin(
      destinationLocation,
      eq(movements.destinationLocationId, destinationLocation.id)
    )
    .where(and(eq(movements.lotId, lotId), isNull(movements.deletedAt)))
    .orderBy(asc(movements.createdAt), asc(movements.id))
    .all()

  return buildLotStockHistory({
    lotId: lot.id,
    lotCode: lot.code,
    varietyName: lot.varietyName,
    movements: ledgerMovements,
  })
}

export function getAllLotStockHistories(): LotStockHistory[] {
  return getLotHistoryOptions().flatMap((lot) => {
    const history = getLotStockHistory(lot.id)
    return history ? [history] : []
  })
}

export function buildLotStockHistory({
  lotId,
  lotCode,
  varietyName,
  movements: ledgerMovements,
}: {
  lotId: number
  lotCode: string
  varietyName: string
  movements: LedgerMovement[]
}): LotStockHistory {
  const locationById = new Map<number, string>()

  for (const movement of ledgerMovements) {
    if (movement.originLocationId !== null && movement.originName) {
      locationById.set(movement.originLocationId, movement.originName)
    }
    if (
      movement.destinationLocationId !== null &&
      movement.destinationName
    ) {
      locationById.set(
        movement.destinationLocationId,
        movement.destinationName
      )
    }
  }

  const historyLocations = [...locationById.entries()]
    .map(([locationId, locationName]) => ({ locationId, locationName }))
    .sort((a, b) => a.locationName.localeCompare(b.locationName, "es"))

  const balances = new Map<number, number>()
  for (const location of historyLocations) {
    balances.set(location.locationId, 0)
  }

  const points: StockHistoryPoint[] = []

  for (const movement of ledgerMovements) {
    if (movement.destinationLocationId !== null) {
      const current = balances.get(movement.destinationLocationId) ?? 0
      balances.set(
        movement.destinationLocationId,
        roundKg(current + movement.quantityKg)
      )
    }

    if (movement.originLocationId !== null) {
      const current = balances.get(movement.originLocationId) ?? 0
      balances.set(
        movement.originLocationId,
        roundKg(current - movement.quantityKg)
      )
    }

    points.push({
      timestamp: movement.createdAt,
      movementId: movement.id,
      movementType: movement.type,
      quantityKg: movement.quantityKg,
      originName: movement.originName,
      destinationName: movement.destinationName,
      balances: historyLocations.map((location) => ({
        locationId: location.locationId,
        locationName: location.locationName,
        quantityKg: balances.get(location.locationId) ?? 0,
      })),
    })
  }

  return {
    lotId,
    lotCode,
    varietyName,
    locations: historyLocations,
    points,
  }
}
