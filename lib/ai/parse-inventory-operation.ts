import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import {
  inventoryOperationSchema,
  type MovementResult,
  type ParseOperationContext,
  type ParsedInventoryOperation,
} from "@/lib/inventory/types"

const BAG_PATTERN = /\b(bolsas?|bolsón|bolsones|sacos?)\b/i

function getGeminiModel() {
  return process.env.GEMINI_MODEL ?? "gemini-3.6-flash"
}

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error(
      "Falta GOOGLE_GENERATIVE_AI_API_KEY. Copiá .env.example a .env.local y agregá tu clave de Gemini."
    )
  }
  return apiKey
}

const extractionSchema = z.object({
  type: z
    .enum(["TRANSFER", "COUNT", "AMBIGUOUS"])
    .describe(
      "TRANSFER si el stock se mueve entre dos ubicaciones. COUNT si se informa la cantidad física observada de un lote en una ubicación, sin moverlo. AMBIGUOUS si no se puede decidir."
    ),
  lotCode: z
    .string()
    .describe('Código de lote tal como lo dijo el usuario, ej: "224" o "37A". Vacío si no se mencionó.'),
  quantityKg: z
    .number()
    .optional()
    .describe(
      "Cantidad en kilogramos. Para COUNT es la cantidad física ABSOLUTA observada, no un delta. Omitir si no hay cantidad."
    ),
  origin: z
    .string()
    .describe("Ubicación de origen mencionada. Vacío si no es un TRANSFER."),
  destination: z
    .string()
    .describe("Ubicación de destino mencionada. Vacío si no es un TRANSFER."),
  location: z
    .string()
    .describe(
      "Ubicación del conteo físico mencionada. Vacío si no se mencionó. Nunca inventes un destino para un COUNT."
    ),
  notes: z.string().describe("Notas extra. Vacío si no hay."),
  reason: z
    .string()
    .describe("Por qué el input es ambiguo. Vacío si type no es AMBIGUOUS."),
})

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function toInventoryOperation(
  extracted: z.infer<typeof extractionSchema>,
  context?: ParseOperationContext
): ParsedInventoryOperation | { type: "AMBIGUOUS"; reason?: string } {
  const lotCode = blankToUndefined(extracted.lotCode) ?? context?.lotCode
  const notes = blankToUndefined(extracted.notes)
  const origin = blankToUndefined(extracted.origin)
  const destination = blankToUndefined(extracted.destination)
  const location =
    blankToUndefined(extracted.location) ?? context?.locationName

  let type = extracted.type

  if (context?.expectedType === "COUNT" && type !== "COUNT") {
    if (
      extracted.quantityKg !== undefined &&
      Number.isFinite(extracted.quantityKg) &&
      extracted.quantityKg >= 0
    ) {
      type = "COUNT"
    }
  }

  if (type === "AMBIGUOUS") {
    const reason = blankToUndefined(extracted.reason)
    return reason ? { type: "AMBIGUOUS", reason } : { type: "AMBIGUOUS" }
  }

  if (
    extracted.quantityKg === undefined ||
    Number.isNaN(extracted.quantityKg)
  ) {
    return {
      type: "AMBIGUOUS",
      reason: "Falta la cantidad en kg.",
    }
  }

  if (type === "TRANSFER") {
    return {
      type: "TRANSFER",
      lotCode: lotCode ?? "",
      quantityKg: extracted.quantityKg,
      origin: origin ?? "",
      destination: destination ?? "",
      ...(notes ? { notes } : {}),
    }
  }

  return {
    type: "COUNT",
    ...(lotCode ? { lotCode } : {}),
    quantityKg: extracted.quantityKg,
    ...(location ? { location } : {}),
    ...(notes ? { notes } : {}),
  }
}

function buildSystemPrompt(context?: ParseOperationContext) {
  const contextBlock = context
    ? `

Contexto ya conocido (no lo contradigas; usalo si el usuario omite datos):
${context.lotCode ? `- Lote: ${context.lotCode}` : ""}
${context.locationName ? `- Ubicación: ${context.locationName}` : ""}
${context.expectedType === "COUNT" ? "- El usuario está informando un CONTEO FÍSICO, no un traslado." : ""}
`
    : ""

  return `Sos un asistente que interpreta operaciones de inventario de papa semilla en español rioplatense.
${contextBlock}
Clasificá cada texto como TRANSFER, COUNT o AMBIGUOUS.

TRANSFER — el stock se mueve entre dos ubicaciones.
Ejemplos:
- "Mové 200 kg del lote 224 del Frío 1 al Galpón"
- "Pasamos 300 kilos del lote 241 de Frigorífico 2 al depósito"

COUNT — el usuario informa la cantidad física observada de un lote en una ubicación, sin transferirlo.
Ejemplos:
- "Conté 250 kg del lote 224 en Frigorífico 1"
- "En el Galpón quedaron 180 kg del lote 37A"
- "El lote 224 tiene 250 kilos en el Frío 1"
- "Hay 250 kg del lote 224 en el Frigorífico 1"
- "El lote 224 tiene 250 kg"

Para COUNT:
- quantityKg es la cantidad TOTAL observada ahora, NO un delta ni un agregado.
- NO inventes un destino.
- NO lo conviertas en TRANSFER.
- location puede omitirse si el usuario no la mencionó.

AMBIGUOUS — no hay suficiente contexto para decidir, por ejemplo "sumale 50 kilos al lote 224" sin más datos.
NO inventes semántica. Devolvé AMBIGUOUS.

Reglas estrictas:
- Extraé SOLO información explícita en el texto del usuario (salvo el contexto ya conocido).
- NO inventes cantidades, lotes ni ubicaciones.
- NO estimes valores desconocidos.
- NO calcules stock ni ajustes.
- Entendé español y variantes informales (ej: "frío uno", "galpón").
- Normalizá unidades a kilogramos (kg). "kilos" y "kg" son equivalentes.
- lotCode debe ser string (puede incluir letras, ej: "37A").
- origin, destination y location deben ser los nombres tal como los menciona el usuario, sin mapear a IDs.`
}

export async function parseInventoryOperation(
  rawText: string,
  context?: ParseOperationContext
): Promise<MovementResult<ParsedInventoryOperation>> {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message: "Ingresá una descripción de la operación.",
      },
    }
  }

  if (BAG_PATTERN.test(trimmed) && !/\bkg\b|kilos?|kilogramos?\b/i.test(trimmed)) {
    return {
      ok: false,
      error: {
        code: "BAGS_NOT_SUPPORTED",
        message:
          "No podemos convertir bolsas a kilogramos sin un peso por bolsa definido. Indicá la cantidad en kg.",
      },
    }
  }

  try {
    getApiKey()
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message: error instanceof Error ? error.message : "Error de configuración.",
      },
    }
  }

  try {
    const { object } = await generateObject({
      model: google(getGeminiModel()),
      schema: extractionSchema,
      temperature: 0.1,
      system: buildSystemPrompt(context),
      prompt: trimmed,
    })

    const mapped = toInventoryOperation(object, context)
    const parsed = inventoryOperationSchema.safeParse(mapped)

    if (!parsed.success || parsed.data.type === "AMBIGUOUS") {
      const reason =
        mapped.type === "AMBIGUOUS" ? mapped.reason : undefined
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message: reason
            ? `No pudimos interpretar la operación: ${reason}`
            : "Falta información para registrar la operación. Indicá si es un movimiento o un conteo, con lote y cantidad en kg.",
          details: {
            missing: "tipo de operación, lote, cantidad en kg",
          },
        },
      }
    }

    if (parsed.data.type === "TRANSFER") {
      const transfer = parsedTransferOrError(parsed.data)
      if (!transfer.ok) return transfer
      return { ok: true, data: parsed.data }
    }

    if (parsed.data.quantityKg === undefined || Number.isNaN(parsed.data.quantityKg)) {
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message: "Indicá la cantidad física observada en kg.",
        },
      }
    }

    return { ok: true, data: parsed.data }
  } catch (error) {
    console.error("[parseInventoryOperation]", error)
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message:
          "No pudimos interpretar la operación.\n\nIntentá nuevamente en unos segundos.",
      },
    }
  }
}

function parsedTransferOrError(
  data: Extract<ParsedInventoryOperation, { type: "TRANSFER" }>
): MovementResult<ParsedInventoryOperation> {
  if (!data.lotCode || !data.origin || !data.destination) {
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message: "Falta información para registrar el movimiento.",
        details: {
          missing: "lote, cantidad en kg, origen, destino",
        },
      },
    }
  }

  return { ok: true, data }
}

/** @deprecated Use parseInventoryOperation */
export async function parseMovement(rawText: string) {
  const result = await parseInventoryOperation(rawText)
  if (!result.ok) return result
  if (result.data.type !== "TRANSFER") {
    return {
      ok: false as const,
      error: {
        code: "PARSE_ERROR" as const,
        message: "Falta información para registrar el movimiento.",
        details: { missing: "lote, cantidad en kg, origen, destino" },
      },
    }
  }

  const { type: _type, ...rest } = result.data
  return { ok: true as const, data: rest }
}
