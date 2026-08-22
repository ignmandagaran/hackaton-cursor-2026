"use client"

import { useCallback, useEffect, useRef, useState } from "react"

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? undefined
}

function getVoiceErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "No pudimos acceder al micrófono. Revisá los permisos del navegador o escribí el movimiento manualmente."
    case "no-speech":
      return "No detectamos voz. Intentá nuevamente."
    case "audio-capture":
      return "No pudimos capturar audio. Revisá tu micrófono o escribí el movimiento manualmente."
    default:
      return "Ocurrió un error con el dictado por voz. Intentá nuevamente o escribí el movimiento manualmente."
  }
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionConstructor())

    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
      isListeningRef.current = false
    }
  }, [])

  const clearVoiceError = useCallback(() => {
    setVoiceError(null)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    isListeningRef.current = false
    setInterimTranscript("")
  }, [])

  const startListening = useCallback(
    (onFinalTranscript: (text: string) => void) => {
      if (isListeningRef.current) return

      const SpeechRecognition = getSpeechRecognitionConstructor()
      if (!SpeechRecognition) return

      setVoiceError(null)
      setInterimTranscript("")
      recognitionRef.current?.abort()

      const recognition = new SpeechRecognition()
      recognition.lang = "es-AR"
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let interim = ""
        let final = ""

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index]
          const transcript = result?.[0]?.transcript ?? ""
          if (result?.isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        if (interim) {
          setInterimTranscript(interim.trim())
        }

        if (final.trim()) {
          setInterimTranscript("")
          onFinalTranscript(final.trim())
        }
      }

      recognition.onerror = (event) => {
        setInterimTranscript("")
        setVoiceError(getVoiceErrorMessage(event.error))
        setIsListening(false)
        isListeningRef.current = false
      }

      recognition.onend = () => {
        setIsListening(false)
        isListeningRef.current = false
        setInterimTranscript("")
      }

      recognitionRef.current = recognition
      setIsListening(true)
      isListeningRef.current = true

      try {
        recognition.start()
      } catch {
        setVoiceError(
          "No pudimos iniciar el dictado por voz. Intentá nuevamente o escribí el movimiento manualmente."
        )
        setIsListening(false)
        isListeningRef.current = false
      }
    },
    []
  )

  const toggleListening = useCallback(
    (onFinalTranscript: (text: string) => void) => {
      if (isListeningRef.current) {
        stopListening()
        return
      }
      startListening(onFinalTranscript)
    },
    [startListening, stopListening]
  )

  return {
    isSupported,
    isListening,
    interimTranscript,
    voiceError,
    clearVoiceError,
    toggleListening,
    stopListening,
  }
}
