import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { locationAliases, locations, lots, varieties } from "@/db/schema"
import { normalizeText } from "@/lib/inventory/normalize"
import { getLocationsWithLotStock } from "@/lib/inventory/stock"
import type {
  CountLocationChoice,
  MovementError,
  MovementResult,
  ParsedCount,
  ParsedMovement,
  ResolvedCount,
  ResolvedMovement,
} from "@/lib/inventory/types"

export function findLotByCode(lotCode: string) {
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

export function findLocationsByQuery(query: string) {
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

export function getLocationById(locationId: number) {
  const db = getDb()
  return (
    db
      .select({
        id: locations.id,
        name: locations.name,
      })
      .from(locations)
      .where(eq(locations.id, locationId))
      .get() ?? null
  )
}

function resolveLocation(
  query: string,
  role: "origin" | "destination" | "location"
): MovementResult<{ id: number; name: string }> {
  const matches = findLocationsByQuery(query)

  const notFoundCode =
    role === "origin"
      ? "ORIGIN_NOT_FOUND"
      : role === "destination"
        ? "DESTINATION_NOT_FOUND"
        : "LOCATION_NOT_FOUND"

  const ambiguousCode =
    role === "origin"
      ? "AMBIGUOUS_ORIGIN"
      : role === "destination"
        ? "AMBIGUOUS_DESTINATION"
        : "AMBIGUOUS_LOCATION"

  if (matches.length === 0) {
    return {
      ok: false,
      error: {
        code: notFoundCode,
        message: `No encontramos la ubicación "${query}".`,
      },
    }
  }

  if (matches.length > 1) {
    return {
      ok: false,
      error: {
        code: ambiguousCode,
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
        code: notFoundCode,
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

export type ResolveCountResult =
  | { status: "resolved"; data: ResolvedCount }
  | { status: "needs_location"; data: CountLocationChoice }
  | { status: "error"; error: MovementError }

export function resolveCountEntities({
  parsed,
  rawInput,
  locationId,
}: {
  parsed: ParsedCount
  rawInput: string
  locationId?: number
}): ResolveCountResult {
  if (!parsed.lotCode) {
    return {
      status: "error",
      error: {
        code: "PARSE_ERROR",
        message: "Indicá el lote del conteo.",
        details: { missing: "lote" },
      },
    }
  }

  const lot = findLotByCode(parsed.lotCode)
  if (!lot) {
    return {
      status: "error",
      error: {
        code: "LOT_NOT_FOUND",
        message: `No encontramos el lote ${parsed.lotCode}.`,
      },
    }
  }

  const resolvedNotes = parsed.notes
  const base = {
    lotId: lot.id,
    lotCode: lot.code,
    varietyName: lot.varietyName,
    countedKg: parsed.quantityKg,
    ...(resolvedNotes ? { notes: resolvedNotes } : {}),
  }

  if (locationId !== undefined) {
    const location = getLocationById(locationId)
    if (!location) {
      return {
        status: "error",
        error: {
          code: "LOCATION_NOT_FOUND",
          message: "No encontramos la ubicación del conteo.",
        },
      }
    }

    return {
      status: "resolved",
      data: {
        ...base,
        locationId: location.id,
        locationName: location.name,
      },
    }
  }

  if (parsed.location) {
    const locationResult = resolveLocation(parsed.location, "location")
    if (!locationResult.ok) {
      return { status: "error", error: locationResult.error }
    }

    return {
      status: "resolved",
      data: {
        ...base,
        locationId: locationResult.data.id,
        locationName: locationResult.data.name,
      },
    }
  }

  const stockLocations = getLocationsWithLotStock(lot.id)

  if (stockLocations.length === 1) {
    const only = stockLocations[0]
    if (!only) {
      return {
        status: "error",
        error: {
          code: "LOCATION_REQUIRED",
          message: "Indicá en qué ubicación realizaste el conteo.",
        },
      }
    }

    return {
      status: "resolved",
      data: {
        ...base,
        locationId: only.locationId,
        locationName: only.locationName,
      },
    }
  }

  if (stockLocations.length > 1) {
    return {
      status: "needs_location",
      data: {
        ...base,
        rawInput,
        locations: stockLocations,
      },
    }
  }

  return {
    status: "error",
    error: {
      code: "LOCATION_REQUIRED",
      message: "Indicá en qué ubicación realizaste el conteo.",
    },
  }
}
