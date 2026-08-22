import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import {
  parsedMovementSchema,
  type MovementResult,
  type ParsedMovement,
} from "@/lib/inventory/types"

const BAG_PATTERN = /\b(bolsas?|bolsón|bolsones|sacos?)\b/i

function getGeminiModel() {
  return process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
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

export async function parseMovement(
  rawText: string
): Promise<MovementResult<ParsedMovement>> {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message: "Ingresá una descripción del movimiento.",
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
      schema: parsedMovementSchema,
      temperature: 0.1,
      system: `Sos un asistente que extrae movimientos de stock de papa semilla en español rioplatense.

Reglas estrictas:
- Extraé SOLO información explícita en el texto del usuario.
- NO inventes cantidades, lotes ni ubicaciones.
- NO estimes valores desconocidos.
- Entendé español y variantes informales (ej: "frío uno", "galpón").
- Normalizá unidades a kilogramos (kg). "kilos" y "kg" son equivalentes.
- lotCode debe ser string (puede incluir letras, ej: "37A").
- origin y destination deben ser los nombres tal como los menciona el usuario, sin mapear a IDs.
- Si falta algún dato esencial, devolvé el mejor esfuerzo con lo disponible; la app validará después.`,
      prompt: trimmed,
    })

    const parsed = parsedMovementSchema.safeParse(object)
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message:
            "No pudimos interpretar el movimiento. Verificá lote, cantidad, origen y destino.",
        },
      }
    }

    return { ok: true, data: parsed.data }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "PARSE_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Error al interpretar el movimiento con Gemini.",
      },
    }
  }
}
