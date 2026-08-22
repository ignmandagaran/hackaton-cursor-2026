"use server"

import {
  MAX_SPEECH_AUDIO_BYTES,
  transcribeSpeech,
} from "@/lib/ai/transcribe-speech"

export type TranscribeSpeechActionResult =
  | { ok: true; transcript: string }
  | { ok: false; error: string }

export async function transcribeSpeechAction(
  formData: FormData
): Promise<TranscribeSpeechActionResult> {
  const audio = formData.get("audio")
  if (!(audio instanceof Blob) || audio.size === 0) {
    return { ok: false, error: "No se recibió audio para transcribir." }
  }

  if (audio.size > MAX_SPEECH_AUDIO_BYTES) {
    return {
      ok: false,
      error: "El audio es demasiado largo. Dictá un movimiento más corto.",
    }
  }

  const bytes = new Uint8Array(await audio.arrayBuffer())
  const result = await transcribeSpeech(bytes)
  if (!result.ok) {
    return { ok: false, error: result.error.message }
  }

  return { ok: true, transcript: result.transcript }
}
