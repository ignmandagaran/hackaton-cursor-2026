import { desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"
import { getDb } from "@/db"
import {
  locations,
  lots,
  movements,
  varieties,
  type MovementType,
} from "@/db/schema"

export type RecentMovement = {
  id: number
  type: MovementType
  lotId: number
  lotCode: string
  varietyName: string
  quantityKg: number
  originName: string | null
  destinationName: string | null
  createdAt: string
  deletedAt: string | null
}

function buildMovementsQuery() {
  const db = getDb()
  const originLocation = alias(locations, "origin_location")
  const destinationLocation = alias(locations, "destination_location")

  return db
    .select({
      id: movements.id,
      type: movements.type,
      lotId: lots.id,
      lotCode: lots.code,
      varietyName: varieties.name,
      quantityKg: movements.quantityKg,
      originName: originLocation.name,
      destinationName: destinationLocation.name,
      createdAt: movements.createdAt,
      deletedAt: movements.deletedAt,
    })
    .from(movements)
    .innerJoin(lots, eq(movements.lotId, lots.id))
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .leftJoin(originLocation, eq(movements.originLocationId, originLocation.id))
    .leftJoin(
      destinationLocation,
      eq(movements.destinationLocationId, destinationLocation.id)
    )
    .orderBy(desc(movements.createdAt), desc(movements.id))
}

export function getRecentMovements(limit = 10): RecentMovement[] {
  return buildMovementsQuery().limit(limit).all()
}

export function getAllMovements(): RecentMovement[] {
  return buildMovementsQuery().all()
}
