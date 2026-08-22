import { getDb } from "@/db"
import { movements } from "@/db/schema"
import { kgEqual, roundKg } from "@/lib/inventory/kg-tolerance"
import { getAvailableStock } from "@/lib/inventory/stock"
import { createStockCount } from "@/lib/inventory/stock-counts"
import type {
  ConfirmedCount,
  CountPreview,
  MovementResult,
} from "@/lib/inventory/types"

export function confirmPhysicalCount(
  preview: Pick<
    CountPreview,
    | "lotId"
    | "lotCode"
    | "varietyName"
    | "locationId"
    | "locationName"
    | "countedKg"
    | "rawInput"
    | "notes"
  >
): MovementResult<ConfirmedCount> {
  if (!Number.isFinite(preview.countedKg) || preview.countedKg < 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_QUANTITY",
        message: "La cantidad contada no puede ser negativa.",
      },
    }
  }

  const db = getDb()

  try {
    const confirmed = db.transaction((tx) => {
      const expectedKg = getAvailableStock({
        lotId: preview.lotId,
        locationId: preview.locationId,
      })
      const countedKg = roundKg(preview.countedKg)
      const differenceKg = roundKg(countedKg - expectedKg)
      const hasDifference = !kgEqual(differenceKg, 0)

      const stockCount = createStockCount(
        {
          lotId: preview.lotId,
          locationId: preview.locationId,
          quantityKg: countedKg,
          notes: preview.notes,
        },
        tx
      )

      let adjustmentId: number | null = null

      if (hasDifference) {
        const createdAt = new Date().toISOString()
        const absDifference = roundKg(Math.abs(differenceKg))
        const isPositive = differenceKg > 0

        const insertValues: typeof movements.$inferInsert = {
          createdAt,
          type: "ADJUSTMENT",
          lotId: preview.lotId,
          originLocationId: isPositive ? null : preview.locationId,
          destinationLocationId: isPositive ? preview.locationId : null,
          quantityKg: absDifference,
          rawInput: preview.rawInput,
          source: "NATURAL_LANGUAGE",
          stockCountId: stockCount.id,
        }

        if (preview.notes) {
          insertValues.notes = preview.notes
        }

        const result = tx.insert(movements).values(insertValues).run()
        adjustmentId = Number(result.lastInsertRowid)
      }

      const resultingKg = getAvailableStock({
        lotId: preview.lotId,
        locationId: preview.locationId,
      })

      return {
        stockCountId: stockCount.id,
        adjustmentId,
        lotCode: preview.lotCode,
        varietyName: preview.varietyName,
        locationName: preview.locationName,
        expectedKg,
        countedKg,
        differenceKg: hasDifference ? differenceKg : 0,
        resultingKg,
      } satisfies ConfirmedCount
    })

    return { ok: true, data: confirmed }
  } catch (error) {
    console.error("[confirmPhysicalCount]", error)
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message: "No pudimos registrar el conteo. Intentá nuevamente.",
      },
    }
  }
}
