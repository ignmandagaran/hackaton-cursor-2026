import { getDb } from "@/db"
import { movements } from "@/db/schema"
import { getAvailableStock } from "@/lib/inventory/stock"
import type { MovementResult, ValidatedMovement, CreatedMovement } from "@/lib/inventory/types"

export type { CreatedMovement }

export function createMovement(
  validated: ValidatedMovement,
  rawInput: string
): MovementResult<CreatedMovement> {
  const db = getDb()

  const revalidation = getAvailableStock({
    lotId: validated.lotId,
    locationId: validated.originId,
  })

  if (revalidation < validated.quantityKg) {
    return {
      ok: false,
      error: {
        code: "INSUFFICIENT_STOCK",
        message: "Stock insuficiente",
        details: {
          requested: validated.quantityKg,
          available: revalidation,
          lotCode: validated.lotCode,
          origin: validated.originName,
        },
      },
    }
  }

  const createdAt = new Date().toISOString()

  const insertValues: typeof movements.$inferInsert = {
    createdAt,
    type: "TRANSFER",
    lotId: validated.lotId,
    originLocationId: validated.originId,
    destinationLocationId: validated.destinationId,
    quantityKg: validated.quantityKg,
    rawInput,
    source: "NATURAL_LANGUAGE",
  }

  if (validated.notes) {
    insertValues.notes = validated.notes
  }

  const result = db.insert(movements).values(insertValues).run()

  const remainingStock = getAvailableStock({
    lotId: validated.lotId,
    locationId: validated.originId,
  })

  const destinationStock = getAvailableStock({
    lotId: validated.lotId,
    locationId: validated.destinationId,
  })

  return {
    ok: true,
    data: {
      movementId: Number(result.lastInsertRowid),
      lotCode: validated.lotCode,
      quantityKg: validated.quantityKg,
      originName: validated.originName,
      destinationName: validated.destinationName,
      remainingStock,
      destinationStock,
    },
  }
}
