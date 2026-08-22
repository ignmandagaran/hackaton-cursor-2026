"use client"

import { useCallback, useEffect, useRef, useState } from "react"

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === "undefined") return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? undefined
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionConstructor())

    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback(
    (onTranscript: (text: string) => void) => {
      const SpeechRecognition = getSpeechRecognitionConstructor()
      if (!SpeechRecognition) return

      recognitionRef.current?.abort()

      const recognition = new SpeechRecognition()
      recognition.lang = "es-AR"
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let transcript = ""
        for (let index = 0; index < event.results.length; index += 1) {
          transcript += event.results[index]?.[0]?.transcript ?? ""
        }
        onTranscript(transcript.trim())
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      setIsListening(true)

      try {
        recognition.start()
      } catch {
        setIsListening(false)
      }
    },
    []
  )

  const toggleListening = useCallback(
    (onTranscript: (text: string) => void) => {
      if (isListening) {
        stopListening()
        return
      }
      startListening(onTranscript)
    },
    [isListening, startListening, stopListening]
  )

  return { isSupported, isListening, toggleListening, stopListening }
}
