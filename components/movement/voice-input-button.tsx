"use client"

import { Microphone, Stop } from "@phosphor-icons/react"
import { InputGroupButton } from "@/components/ui/input-group"
import { cn } from "@/lib/styles/cn"

type VoiceInputButtonProps = {
  isListening: boolean
  disabled?: boolean
  onClick: () => void
}

export function VoiceInputButton({
  isListening,
  disabled = false,
  onClick,
}: VoiceInputButtonProps) {
  return (
    <InputGroupButton
      size="sm"
      variant={isListening ? "destructive" : "ghost"}
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? "Detener dictado" : "Dictar movimiento"}
      aria-pressed={isListening}
      className="shrink-0 gap-1.5 px-2.5"
    >
      {isListening ? (
        <>
          <Stop className="size-3.5" weight="fill" />
          <span className="hidden text-xs sm:inline">Detener</span>
        </>
      ) : (
        <>
          <Microphone className="size-3.5" weight="regular" />
          <span className="hidden text-xs sm:inline">Dictar</span>
        </>
      )}
    </InputGroupButton>
  )
}

export function VoiceListeningStatus({
  interimTranscript,
}: {
  interimTranscript: string
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="flex items-center gap-1.5 text-destructive">
        <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-destructive" />
        Escuchando…
      </p>
      {interimTranscript ? (
        <p className="text-muted-foreground italic">
          &ldquo;{interimTranscript}&hellip;&rdquo;
        </p>
      ) : null}
    </div>
  )
}

export function VoiceErrorMessage({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  return (
    <p className={cn("text-destructive text-sm", className)} role="alert">
      {message}
    </p>
  )
}
