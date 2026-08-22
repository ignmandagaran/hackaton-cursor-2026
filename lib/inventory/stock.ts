import { and, eq, isNotNull, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { movements } from "@/db/schema"

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
        eq(movements.destinationLocationId, locationId)
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
        isNotNull(movements.originLocationId)
      )
    )
    .get()

  const incomingTotal = incoming?.total ?? 0
  const outgoingTotal = outgoing?.total ?? 0

  return Math.round((incomingTotal - outgoingTotal) * 100) / 100
}
