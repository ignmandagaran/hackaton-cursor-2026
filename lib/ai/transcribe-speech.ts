import { openai } from "@ai-sdk/openai"
import { NoTranscriptGeneratedError, transcribe } from "ai"

export const MAX_SPEECH_AUDIO_BYTES = 4 * 1024 * 1024

const WHISPER_PROMPT = "Mové 500 kg del lote 224 del Frigorífico 1 al Galpón."

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      "Falta OPENAI_API_KEY. Agregá tu clave de OpenAI para transcribir con Whisper."
    )
  }
  return apiKey
}

export type TranscribeSpeechResult =
  | { ok: true; transcript: string }
  | { ok: false; error: { message: string } }

export async function transcribeSpeech(
  audio: Uint8Array
): Promise<TranscribeSpeechResult> {
  if (audio.byteLength === 0) {
    return {
      ok: false,
      error: { message: "No se capturó audio. Intentá de nuevo." },
    }
  }

  if (audio.byteLength > MAX_SPEECH_AUDIO_BYTES) {
    return {
      ok: false,
      error: {
        message: "El audio es demasiado largo. Dictá un movimiento más corto.",
      },
    }
  }

  try {
    getApiKey()
  } catch (error) {
    return {
      ok: false,
      error: {
        message:
          error instanceof Error ? error.message : "Error de configuración.",
      },
    }
  }

  try {
    const result = await transcribe({
      model: openai.transcription("whisper-1"),
      audio,
      abortSignal: AbortSignal.timeout(30_000),
      providerOptions: {
        openai: {
          language: "es",
          prompt: WHISPER_PROMPT,
          temperature: 0,
        },
      },
    })

    const transcript = result.text.trim()
    if (!transcript) {
      return {
        ok: false,
        error: {
          message: "No se detectó habla en el audio. Intentá de nuevo.",
        },
      }
    }

    return { ok: true, transcript }
  } catch (error) {
    console.error("[transcribeSpeech]", error)

    if (NoTranscriptGeneratedError.isInstance(error)) {
      return {
        ok: false,
        error: {
          message: "Whisper no pudo transcribir el audio. Intentá de nuevo.",
        },
      }
    }

    return {
      ok: false,
      error: {
        message:
          "No pudimos transcribir el audio con Whisper.\n\nIntentá nuevamente en unos segundos.",
      },
    }
  }
}
