import { z } from "zod"

export const discrepancyAnalysisSchema = z.object({
  summary: z.string(),
  hypotheses: z.array(
    z.object({
      explanation: z.string(),
      confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
    })
  ),
  evidenceSufficient: z.boolean(),
})

export type DiscrepancyAnalysis = z.infer<typeof discrepancyAnalysisSchema>

export type DiscrepancyAnalysisResult =
  | { ok: true; data: DiscrepancyAnalysis }
  | { ok: false; error: string }
