import { getAvailableStock } from "@/lib/inventory/stock"
import type {
  MovementResult,
  ResolvedMovement,
  ValidatedMovement,
} from "@/lib/inventory/types"

export function validateMovement(
  resolved: ResolvedMovement
): MovementResult<ValidatedMovement> {
  if (resolved.quantityKg <= 0) {
    return {
      ok: false,
      error: {
        code: "INVALID_QUANTITY",
        message: "La cantidad debe ser mayor a cero.",
      },
    }
  }

  if (resolved.originId === resolved.destinationId) {
    return {
      ok: false,
      error: {
        code: "SAME_ORIGIN_DESTINATION",
        message: "El origen y el destino no pueden ser la misma ubicación.",
      },
    }
  }

  const availableStock = getAvailableStock({
    lotId: resolved.lotId,
    locationId: resolved.originId,
  })

  if (availableStock < resolved.quantityKg) {
    return {
      ok: false,
      error: {
        code: "INSUFFICIENT_STOCK",
        message: "Stock insuficiente",
        details: {
          requested: resolved.quantityKg,
          available: availableStock,
          lotCode: resolved.lotCode,
          origin: resolved.originName,
        },
      },
    }
  }

  const stockAfter =
    Math.round((availableStock - resolved.quantityKg) * 100) / 100

  const destinationStock = getAvailableStock({
    lotId: resolved.lotId,
    locationId: resolved.destinationId,
  })

  const destinationStockAfter =
    Math.round((destinationStock + resolved.quantityKg) * 100) / 100

  return {
    ok: true,
    data: {
      ...resolved,
      availableStock,
      stockAfter,
      destinationStock,
      destinationStockAfter,
    },
  }
}
