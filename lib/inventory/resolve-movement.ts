import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { locationAliases, locations, lots, varieties } from "@/db/schema"
import { normalizeText } from "@/lib/inventory/normalize"
import type {
  MovementResult,
  ParsedMovement,
  ResolvedMovement,
} from "@/lib/inventory/types"

function findLotByCode(lotCode: string) {
  const db = getDb()
  const normalizedCode = normalizeText(lotCode)

  const allLots = db
    .select({
      id: lots.id,
      code: lots.code,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .all()

  const matches = allLots.filter(
    (lot) => normalizeText(lot.code) === normalizedCode
  )

  return matches[0] ?? null
}

function findLocationsByQuery(query: string) {
  const db = getDb()
  const normalizedQuery = normalizeText(query)

  const allLocations = db
    .select({
      id: locations.id,
      name: locations.name,
    })
    .from(locations)
    .all()

  const nameMatches = allLocations.filter(
    (location) => normalizeText(location.name) === normalizedQuery
  )

  if (nameMatches.length > 0) {
    return nameMatches
  }

  const aliasRows = db
    .select({
      id: locations.id,
      name: locations.name,
      alias: locationAliases.alias,
    })
    .from(locationAliases)
    .innerJoin(locations, eq(locationAliases.locationId, locations.id))
    .all()

  const aliasMatches = aliasRows.filter(
    (row) => normalizeText(row.alias) === normalizedQuery
  )

  const uniqueById = new Map<number, { id: number; name: string }>()
  for (const match of aliasMatches) {
    uniqueById.set(match.id, { id: match.id, name: match.name })
  }

  return [...uniqueById.values()]
}

function resolveLocation(
  query: string,
  role: "origin" | "destination"
): MovementResult<{ id: number; name: string }> {
  const matches = findLocationsByQuery(query)

  if (matches.length === 0) {
    return {
      ok: false,
      error: {
        code:
          role === "origin" ? "ORIGIN_NOT_FOUND" : "DESTINATION_NOT_FOUND",
        message: `No encontramos la ubicación "${query}".`,
      },
    }
  }

  if (matches.length > 1) {
    return {
      ok: false,
      error: {
        code:
          role === "origin" ? "AMBIGUOUS_ORIGIN" : "AMBIGUOUS_DESTINATION",
        message: "Encontramos más de una ubicación posible.",
        details: {
          query,
          matches: matches.map((m) => m.name).join(", "),
        },
      },
    }
  }

  const match = matches[0]
  if (!match) {
    return {
      ok: false,
      error: {
        code:
          role === "origin" ? "ORIGIN_NOT_FOUND" : "DESTINATION_NOT_FOUND",
        message: `No encontramos la ubicación "${query}".`,
      },
    }
  }

  return { ok: true, data: match }
}

export function resolveMovementEntities(
  parsed: ParsedMovement
): MovementResult<ResolvedMovement> {
  const lot = findLotByCode(parsed.lotCode)
  if (!lot) {
    return {
      ok: false,
      error: {
        code: "LOT_NOT_FOUND",
        message: `No encontramos el lote ${parsed.lotCode}.`,
      },
    }
  }

  const originResult = resolveLocation(parsed.origin, "origin")
  if (!originResult.ok) return originResult

  const destinationResult = resolveLocation(parsed.destination, "destination")
  if (!destinationResult.ok) return destinationResult

  const resolved: ResolvedMovement = {
    lotCode: lot.code,
    lotId: lot.id,
    varietyName: lot.varietyName,
    quantityKg: parsed.quantityKg,
    originName: originResult.data.name,
    originId: originResult.data.id,
    destinationName: destinationResult.data.name,
    destinationId: destinationResult.data.id,
  }

  if (parsed.notes) {
    resolved.notes = parsed.notes
  }

  return { ok: true, data: resolved }
}
