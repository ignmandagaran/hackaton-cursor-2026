"use server"

import { revalidatePath } from "next/cache"
import { parseMovement } from "@/lib/ai/parse-movement"
import { routing } from "@/i18n/routing"
import { createMovement } from "@/lib/inventory/create-movement"
import { resolveMovementEntities } from "@/lib/inventory/resolve-movement"
import type {
  CreatedMovement,
  MovementError,
  MovementPreview,
} from "@/lib/inventory/types"
import { validateMovement } from "@/lib/inventory/validate-movement"

export type InterpretResult =
  | { ok: true; preview: MovementPreview }
  | { ok: false; error: MovementError }

export type ConfirmPayload = {
  lotId: number
  lotCode: string
  quantityKg: number
  originId: number
  originName: string
  destinationId: number
  destinationName: string
  varietyName: string
  availableStock: number
  stockAfter: number
  rawInput: string
  notes?: string | undefined
}

export type ConfirmResult =
  | { ok: true; result: CreatedMovement }
  | { ok: false; error: MovementError }

export async function interpretMovement(
  rawText: string
): Promise<InterpretResult> {
  const parsed = await parseMovement(rawText)
  if (!parsed.ok) return parsed

  const resolved = resolveMovementEntities(parsed.data)
  if (!resolved.ok) return resolved

  const validated = validateMovement(resolved.data)
  if (!validated.ok) return validated

  return {
    ok: true,
    preview: {
      ...validated.data,
      rawInput: rawText.trim(),
    },
  }
}

export async function confirmMovement(
  payload: ConfirmPayload
): Promise<ConfirmResult> {
  const validated = validateMovement({
    lotId: payload.lotId,
    lotCode: payload.lotCode,
    varietyName: payload.varietyName,
    quantityKg: payload.quantityKg,
    originId: payload.originId,
    originName: payload.originName,
    destinationId: payload.destinationId,
    destinationName: payload.destinationName,
    notes: payload.notes,
  })

  if (!validated.ok) return validated

  const created = createMovement(validated.data, payload.rawInput)
  if (!created.ok) return created

  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? "/" : `/${locale}`
    revalidatePath(path)
  }

  return { ok: true, result: created.data }
}
