import { kgEqual, roundKg } from "@/lib/inventory/kg-tolerance"
import { getAvailableStock } from "@/lib/inventory/stock"
import type { CountPreview, ResolvedCount } from "@/lib/inventory/types"

export function buildCountPreview(
  resolved: ResolvedCount,
  rawInput: string
): CountPreview {
  const expectedKg = getAvailableStock({
    lotId: resolved.lotId,
    locationId: resolved.locationId,
  })
  const countedKg = roundKg(resolved.countedKg)
  const differenceKg = roundKg(countedKg - expectedKg)

  return {
    ...resolved,
    countedKg,
    expectedKg,
    differenceKg: kgEqual(differenceKg, 0) ? 0 : differenceKg,
    rawInput,
  }
}
