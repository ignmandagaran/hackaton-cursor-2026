"use server"

import { parseInventoryOperation } from "@/lib/ai/parse-inventory-operation"
import { confirmPhysicalCount } from "@/lib/inventory/confirm-count"
import { createMovement } from "@/lib/inventory/create-movement"
import { softDeleteMovement } from "@/lib/inventory/delete-movement"
import {
  findLotByCode,
  getLocationById,
  resolveCountEntities,
  resolveMovementEntities,
} from "@/lib/inventory/resolve-movement"
import { revalidateInventoryPaths } from "@/lib/inventory/revalidate-inventory"
import type {
  ConfirmedCount,
  CountLocationChoice,
  CountPreview,
  CreatedMovement,
  MovementError,
  MovementPreview,
  ParseOperationContext,
  PendingTransfer,
  ResolvedMovement,
} from "@/lib/inventory/types"
import { buildCountPreview } from "@/lib/inventory/validate-count"
import { validateMovement } from "@/lib/inventory/validate-movement"

export type InterpretResult =
  | { ok: true; kind: "TRANSFER"; preview: MovementPreview }
  | { ok: true; kind: "COUNT"; preview: CountPreview }
  | { ok: true; kind: "COUNT_LOCATION_CHOICE"; choice: CountLocationChoice }
  | { ok: false; error: MovementError; pendingTransfer?: PendingTransfer }

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
  | { ok: false; error: MovementError; pendingTransfer?: PendingTransfer }

export type ConfirmCountPayload = {
  lotId: number
  lotCode: string
  varietyName: string
  locationId: number
  locationName: string
  countedKg: number
  rawInput: string
  notes?: string | undefined
}

export type ConfirmCountResult =
  | { ok: true; result: ConfirmedCount }
  | { ok: false; error: MovementError }

export type DeleteMovementResult =
  | { ok: true }
  | { ok: false; error: MovementError }

function toPendingTransfer(
  resolved: ResolvedMovement,
  rawInput: string
): PendingTransfer {
  const pending: PendingTransfer = {
    lotId: resolved.lotId,
    lotCode: resolved.lotCode,
    varietyName: resolved.varietyName,
    quantityKg: resolved.quantityKg,
    originId: resolved.originId,
    originName: resolved.originName,
    destinationId: resolved.destinationId,
    destinationName: resolved.destinationName,
    rawInput,
  }

  if (resolved.notes) {
    pending.notes = resolved.notes
  }

  return pending
}

function interpretResolvedTransfer(
  resolved: ResolvedMovement,
  rawInput: string
): InterpretResult {
  const validated = validateMovement(resolved)
  if (!validated.ok) {
    if (validated.error.code === "INSUFFICIENT_STOCK") {
      return {
        ok: false,
        error: validated.error,
        pendingTransfer: toPendingTransfer(resolved, rawInput),
      }
    }
    return validated
  }

  return {
    ok: true,
    kind: "TRANSFER",
    preview: {
      ...validated.data,
      rawInput,
    },
  }
}

export async function interpretInventoryOperation(
  rawText: string,
  context?: ParseOperationContext
): Promise<InterpretResult> {
  const parsed = await parseInventoryOperation(rawText, context)
  if (!parsed.ok) return parsed

  const rawInput = rawText.trim()

  if (parsed.data.type === "TRANSFER") {
    const { type: _type, ...transfer } = parsed.data
    const resolved = resolveMovementEntities(transfer)
    if (!resolved.ok) return resolved
    return interpretResolvedTransfer(resolved.data, rawInput)
  }

  const resolved = resolveCountEntities({
    parsed: parsed.data,
    rawInput,
  })

  if (resolved.status === "error") {
    return { ok: false, error: resolved.error }
  }

  if (resolved.status === "needs_location") {
    return { ok: true, kind: "COUNT_LOCATION_CHOICE", choice: resolved.data }
  }

  return {
    ok: true,
    kind: "COUNT",
    preview: buildCountPreview(resolved.data, rawInput),
  }
}

export async function interpretMovement(
  rawText: string
): Promise<InterpretResult> {
  return interpretInventoryOperation(rawText)
}

export async function previewCountAtLocation(payload: {
  lotId: number
  lotCode: string
  varietyName: string
  locationId: number
  countedKg: number
  rawInput: string
  notes?: string | undefined
}): Promise<InterpretResult> {
  const location = getLocationById(payload.locationId)
  if (!location) {
    return {
      ok: false,
      error: {
        code: "LOCATION_NOT_FOUND",
        message: "No encontramos la ubicación del conteo.",
      },
    }
  }

  const lot = findLotByCode(payload.lotCode)
  if (!lot || lot.id !== payload.lotId) {
    return {
      ok: false,
      error: {
        code: "LOT_NOT_FOUND",
        message: `No encontramos el lote ${payload.lotCode}.`,
      },
    }
  }

  const resolved = {
    lotId: lot.id,
    lotCode: lot.code,
    varietyName: lot.varietyName,
    locationId: location.id,
    locationName: location.name,
    countedKg: payload.countedKg,
    ...(payload.notes ? { notes: payload.notes } : {}),
  }

  return {
    ok: true,
    kind: "COUNT",
    preview: buildCountPreview(resolved, payload.rawInput),
  }
}

export async function previewPendingTransfer(
  pending: PendingTransfer
): Promise<InterpretResult> {
  return interpretResolvedTransfer(
    {
      lotId: pending.lotId,
      lotCode: pending.lotCode,
      varietyName: pending.varietyName,
      quantityKg: pending.quantityKg,
      originId: pending.originId,
      originName: pending.originName,
      destinationId: pending.destinationId,
      destinationName: pending.destinationName,
      notes: pending.notes,
    },
    pending.rawInput
  )
}

export async function confirmMovement(
  payload: ConfirmPayload
): Promise<ConfirmResult> {
  const resolved: ResolvedMovement = {
    lotId: payload.lotId,
    lotCode: payload.lotCode,
    varietyName: payload.varietyName,
    quantityKg: payload.quantityKg,
    originId: payload.originId,
    originName: payload.originName,
    destinationId: payload.destinationId,
    destinationName: payload.destinationName,
    notes: payload.notes,
  }

  const validated = validateMovement(resolved)

  if (!validated.ok) {
    if (validated.error.code === "INSUFFICIENT_STOCK") {
      return {
        ok: false,
        error: validated.error,
        pendingTransfer: toPendingTransfer(resolved, payload.rawInput),
      }
    }
    return validated
  }

  const created = createMovement(validated.data, payload.rawInput)
  if (!created.ok) {
    if (created.error.code === "INSUFFICIENT_STOCK") {
      return {
        ok: false,
        error: created.error,
        pendingTransfer: toPendingTransfer(resolved, payload.rawInput),
      }
    }
    return created
  }

  revalidateInventoryPaths()
  return { ok: true, result: created.data }
}

export async function confirmCount(
  payload: ConfirmCountPayload
): Promise<ConfirmCountResult> {
  const preview = buildCountPreview(
    {
      lotId: payload.lotId,
      lotCode: payload.lotCode,
      varietyName: payload.varietyName,
      locationId: payload.locationId,
      locationName: payload.locationName,
      countedKg: payload.countedKg,
      ...(payload.notes ? { notes: payload.notes } : {}),
    },
    payload.rawInput
  )

  const confirmed = confirmPhysicalCount({
    lotId: preview.lotId,
    lotCode: preview.lotCode,
    varietyName: preview.varietyName,
    locationId: preview.locationId,
    locationName: preview.locationName,
    countedKg: preview.countedKg,
    rawInput: preview.rawInput,
    notes: preview.notes,
  })

  if (!confirmed.ok) return confirmed

  revalidateInventoryPaths()
  return { ok: true, result: confirmed.data }
}

export async function deleteMovement(
  id: number
): Promise<DeleteMovementResult> {
  const result = softDeleteMovement(id)
  if (!result.ok) return result

  revalidateInventoryPaths()

  return { ok: true }
}
