import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { movements } from "@/db/schema"
import { getAvailableStock } from "@/lib/inventory/stock"
import type { MovementResult } from "@/lib/inventory/types"

export function softDeleteMovement(id: number): MovementResult<void> {
  const db = getDb()

  const movement = db
    .select()
    .from(movements)
    .where(eq(movements.id, id))
    .get()

  if (!movement) {
    return {
      ok: false,
      error: {
        code: "MOVEMENT_NOT_FOUND",
        message: "Movimiento no encontrado.",
      },
    }
  }

  if (movement.deletedAt) {
    return {
      ok: false,
      error: {
        code: "MOVEMENT_ALREADY_DELETED",
        message: "Este movimiento ya fue eliminado.",
      },
    }
  }

  const destinationLocationId = movement.destinationLocationId
  if (destinationLocationId) {
    const destinationStock = getAvailableStock({
      lotId: movement.lotId,
      locationId: destinationLocationId,
    })

    if (destinationStock < movement.quantityKg) {
      return {
        ok: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message:
            "No hay stock suficiente en destino para revertir este movimiento.",
          details: {
            requested: movement.quantityKg,
            available: destinationStock,
          },
        },
      }
    }
  }

  db.update(movements)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(movements.id, id))
    .run()

  return { ok: true, data: undefined }
}
