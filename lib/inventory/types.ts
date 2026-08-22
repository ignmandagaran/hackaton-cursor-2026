import { z } from "zod"

export const parsedMovementSchema = z.object({
  lotCode: z.string().min(1),
  quantityKg: z.number().positive(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  notes: z.string().optional(),
})

export type ParsedMovement = z.infer<typeof parsedMovementSchema>

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

export type MovementError = {
  code:
    | "LOT_NOT_FOUND"
    | "ORIGIN_NOT_FOUND"
    | "DESTINATION_NOT_FOUND"
    | "AMBIGUOUS_ORIGIN"
    | "AMBIGUOUS_DESTINATION"
    | "SAME_ORIGIN_DESTINATION"
    | "INSUFFICIENT_STOCK"
    | "INVALID_QUANTITY"
    | "PARSE_ERROR"
    | "BAGS_NOT_SUPPORTED"
  message: string
  details?: Record<string, string | number> | undefined
}

export type MovementResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MovementError }
