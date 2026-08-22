import { z } from "zod"

export const parsedTransferSchema = z.object({
  type: z.literal("TRANSFER"),
  lotCode: z.string().min(1),
  quantityKg: z.number().positive(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  notes: z.string().optional(),
})

export const parsedCountSchema = z.object({
  type: z.literal("COUNT"),
  lotCode: z.string().min(1).optional(),
  quantityKg: z.number().nonnegative(),
  location: z.string().optional(),
  notes: z.string().optional(),
})

export const parsedAmbiguousSchema = z.object({
  type: z.literal("AMBIGUOUS"),
  reason: z.string().optional(),
})

export const inventoryOperationSchema = z.discriminatedUnion("type", [
  parsedTransferSchema,
  parsedCountSchema,
  parsedAmbiguousSchema,
])

export type ParsedTransfer = z.infer<typeof parsedTransferSchema>
export type ParsedCount = z.infer<typeof parsedCountSchema>
export type ParsedInventoryOperation = ParsedTransfer | ParsedCount

/** @deprecated Use ParsedTransfer. Kept for existing transfer-only helpers. */
export const parsedMovementSchema = parsedTransferSchema.omit({ type: true })
export type ParsedMovement = z.infer<typeof parsedMovementSchema>

export type ParseOperationContext = {
  expectedType?: "COUNT"
  lotCode?: string
  locationName?: string
}

export type ResolvedMovement = {
  lotCode: string
  lotId: number
  varietyName: string
  quantityKg: number
  originName: string
  originId: number
  destinationName: string
  destinationId: number
  notes?: string | undefined
}

export type ValidatedMovement = ResolvedMovement & {
  availableStock: number
  stockAfter: number
  destinationStock: number
  destinationStockAfter: number
}

export type CreatedMovement = {
  movementId: number
  lotCode: string
  quantityKg: number
  originName: string
  destinationName: string
  remainingStock: number
  destinationStock: number
}

export type MovementPreview = ValidatedMovement & {
  rawInput: string
}

export type PendingTransfer = {
  lotId: number
  lotCode: string
  varietyName: string
  quantityKg: number
  originId: number
  originName: string
  destinationId: number
  destinationName: string
  rawInput: string
  notes?: string | undefined
}

export type ResolvedCount = {
  lotId: number
  lotCode: string
  varietyName: string
  locationId: number
  locationName: string
  countedKg: number
  notes?: string | undefined
}

export type CountLocationOption = {
  locationId: number
  locationName: string
  quantityKg: number
}

export type CountLocationChoice = {
  lotId: number
  lotCode: string
  varietyName: string
  countedKg: number
  rawInput: string
  notes?: string | undefined
  locations: CountLocationOption[]
}

export type CountPreview = ResolvedCount & {
  expectedKg: number
  differenceKg: number
  rawInput: string
}

export type ConfirmedCount = {
  stockCountId: number
  adjustmentId: number | null
  lotCode: string
  varietyName: string
  locationName: string
  expectedKg: number
  countedKg: number
  differenceKg: number
  resultingKg: number
}

export type MovementError = {
  code:
    | "LOT_NOT_FOUND"
    | "ORIGIN_NOT_FOUND"
    | "DESTINATION_NOT_FOUND"
    | "LOCATION_NOT_FOUND"
    | "AMBIGUOUS_ORIGIN"
    | "AMBIGUOUS_DESTINATION"
    | "AMBIGUOUS_LOCATION"
    | "LOCATION_REQUIRED"
    | "SAME_ORIGIN_DESTINATION"
    | "INSUFFICIENT_STOCK"
    | "INVALID_QUANTITY"
    | "PARSE_ERROR"
    | "BAGS_NOT_SUPPORTED"
    | "MOVEMENT_NOT_FOUND"
    | "MOVEMENT_ALREADY_DELETED"
  message: string
  details?: Record<string, string | number> | undefined
}

export type MovementResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MovementError }
