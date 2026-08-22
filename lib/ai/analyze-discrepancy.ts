import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import type { DiscrepancyEvidence } from "@/lib/inventory/reconciliation"
import {
  discrepancyAnalysisSchema,
  type DiscrepancyAnalysisResult,
} from "@/lib/inventory/reconciliation-types"
import { formatRoute } from "@/lib/inventory/format-route"

function getGeminiModel() {
  return process.env.GEMINI_MODEL ?? "gemini-3.6-flash"
}

function formatEvidence(evidence: DiscrepancyEvidence): string {
  const movementLines = evidence.movements
    .map((movement, index) => {
      const date = new Date(movement.createdAt).toLocaleString("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
      })
      return `${index + 1}. ${movement.quantityKg} kg — ${formatRoute(movement)} — ${date}`
    })
    .join("\n")

  return `Lote: ${evidence.lotCode}
Variedad: ${evidence.varietyName}
Ubicación: ${evidence.locationName}

Stock esperado (sistema): ${evidence.expectedKg} kg
Conteo físico: ${evidence.countedKg} kg
Diferencia: ${evidence.differenceKg} kg

Movimientos relevantes:
${movementLines || "(sin movimientos registrados)"}`
}

export async function analyzeDiscrepancy(
  evidence: DiscrepancyEvidence
): Promise<DiscrepancyAnalysisResult> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Falta GOOGLE_GENERATIVE_AI_API_KEY. Configurá la clave de Gemini para usar el análisis.",
    }
  }

  try {
    const { object } = await generateObject({
      model: google(getGeminiModel()),
      schema: discrepancyAnalysisSchema,
      temperature: 0.2,
      system: `Sos un analista de inventario de papa semilla. Recibís evidencia estructurada sobre una diferencia entre stock del sistema y un conteo físico.

Reglas estrictas:
- Analizá SOLO la evidencia provista. No inventes movimientos, fechas ni cantidades.
- No recalcules stock ni diferencias: los valores ya fueron calculados por el sistema.
- Proponé explicaciones probables distinguiendo hechos de hipótesis.
- Si la evidencia no alcanza para una causa concreta, decilo explícitamente.
- No afirmes certeza si no está respaldada.
- Respondé en español rioplatense, de forma concisa.`,
      prompt: formatEvidence(evidence),
    })

    const parsed = discrepancyAnalysisSchema.safeParse(object)
    if (!parsed.success) {
      return {
        ok: false,
        error: "No pudimos interpretar el análisis de la diferencia.",
      }
    }

    return { ok: true, data: parsed.data }
  } catch (error) {
    console.error("[analyzeDiscrepancy]", error)
    return {
      ok: false,
      error:
        "No pudimos analizar la diferencia.\n\nIntentá nuevamente en unos segundos.",
    }
  }
}
