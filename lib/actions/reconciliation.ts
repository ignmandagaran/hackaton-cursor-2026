"use server"

import { analyzeDiscrepancy } from "@/lib/ai/analyze-discrepancy"
import {
  getDiscrepancyEvidence,
  getReconciliationEntry,
  type StockReconciliation,
} from "@/lib/inventory/reconciliation"
import type { DiscrepancyAnalysis } from "@/lib/inventory/reconciliation-types"

export type DiscrepancyDetail = {
  entry: StockReconciliation
  movements: {
    id: number
    createdAt: string
    quantityKg: number
    originName: string | null
    destinationName: string | null
    type: import("@/db/schema").MovementType
  }[]
}

export type AnalyzeDiscrepancyResult =
  | { ok: true; analysis: DiscrepancyAnalysis }
  | { ok: false; error: string }

export async function fetchDiscrepancyDetail({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): Promise<DiscrepancyDetail | null> {
  const entry = getReconciliationEntry({ lotId, locationId })
  if (!entry || entry.status !== "DISCREPANCY") return null

  const evidence = getDiscrepancyEvidence({ lotId, locationId })
  if (!evidence) return null

  return {
    entry,
    movements: evidence.movements,
  }
}

export async function analyzeDiscrepancyAction({
  lotId,
  locationId,
}: {
  lotId: number
  locationId: number
}): Promise<AnalyzeDiscrepancyResult> {
  const evidence = getDiscrepancyEvidence({ lotId, locationId })
  if (!evidence) {
    return {
      ok: false,
      error: "No hay una diferencia registrada para este lote y ubicación.",
    }
  }

  const result = await analyzeDiscrepancy(evidence)
  if (!result.ok) return result
  return { ok: true, analysis: result.data }
}
