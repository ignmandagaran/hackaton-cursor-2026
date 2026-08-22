"use client"

import { useEffect, useRef, useState } from "react"
import { transcribeSpeechAction } from "@/lib/actions/speech"

const MAX_RECORDING_MS = 30_000

const RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
]

function canRecordAudio(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  )
}

function pickRecorderMimeType(): string | undefined {
  return RECORDER_MIME_CANDIDATES.find((type) =>
    MediaRecorder.isTypeSupported(type)
  )
}

function extensionForMediaType(mediaType: string): string {
  const type = mediaType.split(";")[0]?.trim().toLowerCase()
  switch (type) {
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
      return "m4a"
    case "audio/mpeg":
    case "audio/mp3":
      return "mp3"
    case "audio/wav":
    case "audio/x-wav":
    case "audio/wave":
      return "wav"
    case "audio/ogg":
    case "audio/oga":
      return "ogg"
    default:
      return "webm"
  }
}

function stopStream(stream: MediaStream | null) {
  if (!stream) return
  for (const track of stream.getTracks()) {
    track.stop()
  }
}

function microphoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      return "Necesitamos permiso del micrófono para dictar el movimiento."
    }
    if (error.name === "NotFoundError") {
      return "No encontramos un micrófono en este dispositivo."
    }
    if (error.name === "NotReadableError") {
      return "El micrófono está ocupado por otra aplicación."
    }
  }
  return "No se pudo acceder al micrófono."
}

export function useSpeechToText() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timeoutRef = useRef<number | undefined>(undefined)
  const stoppingRef = useRef(false)
  const abortedRef = useRef(false)
  const onTranscriptRef = useRef<((text: string) => void) | undefined>(
    undefined
  )
  const onErrorRef = useRef<((message: string) => void) | undefined>(undefined)

  useEffect(() => {
    abortedRef.current = false
    setIsSupported(canRecordAudio())

    return () => {
      abortedRef.current = true
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current)
      }
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop()
      }
      stopStream(streamRef.current)
      streamRef.current = null
      recorderRef.current = null
    }
  }, [])

  async function startListening(
    onTranscript: (text: string) => void,
    onError: (message: string) => void
  ) {
    if (isListening || isTranscribing || stoppingRef.current) return

    onTranscriptRef.current = onTranscript
    onErrorRef.current = onError

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      })

      if (abortedRef.current) {
        stopStream(stream)
        return
      }

      streamRef.current = stream
      chunksRef.current = []

      const mimeType = pickRecorderMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      })

      recorder.start()
      recorderRef.current = recorder
      setIsListening(true)

      timeoutRef.current = window.setTimeout(() => {
        void stopAndTranscribe()
      }, MAX_RECORDING_MS)
    } catch (error) {
      onError(microphoneErrorMessage(error))
    }
  }

  async function stopAndTranscribe() {
    if (stoppingRef.current) return
    stoppingRef.current = true

    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    const recorder = recorderRef.current
    const mimeType = recorder?.mimeType || "audio/webm"

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        if (!recorder || recorder.state === "inactive") {
          resolve(new Blob(chunksRef.current, { type: mimeType }))
          return
        }

        recorder.addEventListener(
          "stop",
          () => {
            resolve(new Blob(chunksRef.current, { type: mimeType }))
          },
          { once: true }
        )
        recorder.addEventListener(
          "error",
          () => {
            reject(new Error("Falló la grabación de audio."))
          },
          { once: true }
        )
        recorder.stop()
      })

      stopStream(streamRef.current)
      streamRef.current = null
      recorderRef.current = null
      setIsListening(false)

      if (abortedRef.current) return

      if (blob.size === 0) {
        onErrorRef.current?.("No se capturó audio. Intentá de nuevo.")
        return
      }

      setIsTranscribing(true)
      const formData = new FormData()
      const extension = extensionForMediaType(blob.type || mimeType)
      formData.append("audio", blob, `speech.${extension}`)

      const result = await transcribeSpeechAction(formData)
      if (abortedRef.current) return

      if (!result.ok) {
        onErrorRef.current?.(result.error)
        return
      }

      onTranscriptRef.current?.(result.transcript)
    } catch (error) {
      if (!abortedRef.current) {
        onErrorRef.current?.(
          error instanceof Error
            ? error.message
            : "No pudimos transcribir el audio. Intentá de nuevo."
        )
      }
    } finally {
      stopStream(streamRef.current)
      streamRef.current = null
      recorderRef.current = null
      stoppingRef.current = false
      setIsListening(false)
      setIsTranscribing(false)
    }
  }

  function toggleListening(
    onTranscript: (text: string) => void,
    onError: (message: string) => void
  ) {
    if (isTranscribing) return
    if (isListening) {
      void stopAndTranscribe()
      return
    }
    void startListening(onTranscript, onError)
  }

  return {
    isSupported,
    isListening,
    isTranscribing,
    toggleListening,
  }
}
