"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { formatKg } from "@/lib/inventory/format-kg"
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition"
import type { PendingTransfer } from "@/lib/inventory/types"
import { cn } from "@/lib/styles/cn"
import {
  VoiceErrorMessage,
  VoiceInputButton,
  VoiceListeningStatus,
} from "./voice-input-button"

export function CountCorrectionView({
  pending,
  availableKg,
  text,
  onTextChange,
  onSubmit,
  onBack,
  isPending,
}: {
  pending: PendingTransfer
  availableKg: number
  text: string
  onTextChange: (value: string) => void
  onSubmit: () => void
  onBack: () => void
  isPending: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    isSupported: isVoiceSupported,
    isListening,
    interimTranscript,
    voiceError,
    clearVoiceError,
    toggleListening,
  } = useSpeechRecognition()

  const placeholder = `Conté ${pending.quantityKg} kg del lote ${pending.lotCode} en ${pending.originName}`

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <h2 className="font-heading font-medium text-base">
          Verificar stock físico
        </h2>
        <p className="mt-1 text-muted-foreground">
          Lote {pending.lotCode} · {pending.varietyName}
        </p>
        <p className="text-muted-foreground">{pending.originName}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Stock registrado
            </dt>
            <dd className="font-medium tabular-nums">{formatKg(availableKg)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Necesitás al menos
            </dt>
            <dd className="font-medium tabular-nums">
              {formatKg(pending.quantityKg)}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <label htmlFor="count-correction-input" className="font-medium text-sm">
          Describí el conteo
        </label>
        <p className="mt-1 text-muted-foreground text-xs">
          Ejemplo: &ldquo;Hay {pending.quantityKg} kg&rdquo;
        </p>
      </div>

      <InputGroup
        data-disabled={isPending ? true : undefined}
        className={cn(isPending && "opacity-50")}
      >
        <InputGroupTextarea
          ref={textareaRef}
          id="count-correction-input"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              onSubmit()
            }
          }}
          rows={3}
          disabled={isPending}
          placeholder={placeholder}
        />
        {isVoiceSupported ? (
          <InputGroupAddon align="inline-end" className="self-end pb-2">
            <VoiceInputButton
              isListening={isListening}
              disabled={isPending}
              onClick={() => {
                if (isPending) return
                clearVoiceError()
                toggleListening((transcript) => {
                  if (transcript) onTextChange(transcript)
                })
              }}
            />
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {isListening ? (
        <VoiceListeningStatus interimTranscript={interimTranscript} />
      ) : null}

      {voiceError ? <VoiceErrorMessage message={voiceError} /> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onSubmit} disabled={isPending || !text.trim()}>
          {isPending ? (
            <>
              <Spinner size="sm" />
              Interpretando…
            </>
          ) : (
            "Interpretar conteo"
          )}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={isPending}>
          Volver
        </Button>
      </div>
    </div>
  )
}
