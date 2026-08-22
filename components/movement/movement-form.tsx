"use client"

import { Microphone } from "@phosphor-icons/react"
import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "@/i18n/navigation"
import {
  confirmMovement,
  interpretMovement,
  type ConfirmPayload,
} from "@/lib/actions/movement"
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition"
import type { CreatedMovement, MovementError, MovementPreview } from "@/lib/inventory/types"
import { cn } from "@/lib/styles/cn"
import { MovementErrorView } from "./movement-error"
import { MovementPreviewView } from "./movement-preview"
import { MovementSuccessView } from "./movement-success"

const DEMO_EXAMPLE =
  "Mové 500 kg del lote 224 del Frigorífico 1 al Galpón"

type Step = "input" | "preview" | "success"

type FormError = Pick<MovementError, "message" | "details"> & {
  code?: MovementError["code"]
}

export function MovementForm() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [rawText, setRawText] = useState("")
  const [step, setStep] = useState<Step>("input")
  const [preview, setPreview] = useState<MovementPreview | null>(null)
  const [success, setSuccess] = useState<CreatedMovement | null>(null)
  const [error, setError] = useState<FormError | null>(null)
  const [isPending, startTransition] = useTransition()
  const { isSupported: isVoiceSupported, isListening, toggleListening } =
    useSpeechRecognition()

  const isInterpreting = step === "input" && isPending
  const isConfirming = step === "preview" && isPending

  function handleInterpret() {
    if (!rawText.trim() || isPending) return
    setError(null)
    startTransition(async () => {
      const result = await interpretMovement(rawText)
      if (!result.ok) {
        setError({
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
        })
        return
      }
      setPreview(result.preview)
      setStep("preview")
    })
  }

  function handleConfirm() {
    if (!preview || isPending) return
    setError(null)

    const payload: ConfirmPayload = {
      lotId: preview.lotId,
      lotCode: preview.lotCode,
      quantityKg: preview.quantityKg,
      originId: preview.originId,
      originName: preview.originName,
      destinationId: preview.destinationId,
      destinationName: preview.destinationName,
      varietyName: preview.varietyName,
      availableStock: preview.availableStock,
      stockAfter: preview.stockAfter,
      rawInput: preview.rawInput,
      notes: preview.notes,
    }

    startTransition(async () => {
      const result = await confirmMovement(payload)
      if (!result.ok) {
        setError({
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
        })
        return
      }
      setSuccess(result.result)
      setStep("success")
      router.refresh()
    })
  }

  function handleEdit() {
    setStep("input")
    setPreview(null)
    setError(null)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleReset() {
    setStep("input")
    setPreview(null)
    setSuccess(null)
    setError(null)
    setRawText("")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleUseExample() {
    setRawText(DEMO_EXAMPLE)
    setError(null)
    textareaRef.current?.focus()
  }

  function handleVoiceInput() {
    if (isInterpreting) return
    setError(null)
    toggleListening((transcript) => {
      if (transcript) {
        setRawText(transcript)
      }
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      handleInterpret()
    }
  }

  if (step === "success" && success) {
    return <MovementSuccessView result={success} onReset={handleReset} />
  }

  if (step === "preview" && preview) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <MovementPreviewView preview={preview} />
        {error ? (
          <MovementErrorView error={error} onEdit={handleEdit} />
        ) : null}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEdit} disabled={isPending}>
            Editar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isConfirming ? (
              <>
                <Spinner size="sm" />
                Registrando movimiento…
              </>
            ) : (
              "Confirmar movimiento"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div>
        <label htmlFor="movement-input" className="font-medium text-sm">
          Describí el movimiento en tus palabras.
        </label>
        <p className="mt-1 text-muted-foreground text-xs">
          Ejemplo:{" "}
          <button
            type="button"
            onClick={handleUseExample}
            className="text-left underline-offset-2 hover:underline"
          >
            &ldquo;{DEMO_EXAMPLE}&rdquo;
          </button>
        </p>
      </div>

      <InputGroup
        data-disabled={isInterpreting ? true : undefined}
        className={cn(isInterpreting && "opacity-50")}
      >
        <InputGroupTextarea
          ref={textareaRef}
          id="movement-input"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          disabled={isInterpreting}
          placeholder={DEMO_EXAMPLE}
        />
        {isVoiceSupported ? (
          <InputGroupAddon align="inline-end" className="self-end pb-2">
            <InputGroupButton
              size="icon-sm"
              variant={isListening ? "destructive" : "ghost"}
              onClick={handleVoiceInput}
              disabled={isInterpreting}
              aria-label={
                isListening ? "Dejar de escuchar" : "Dictar movimiento"
              }
              aria-pressed={isListening}
            >
              <Microphone
                className={cn(isListening && "animate-pulse")}
                weight={isListening ? "fill" : "regular"}
              />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {isListening ? (
        <p className="text-muted-foreground text-sm">Escuchando…</p>
      ) : null}

      {isInterpreting ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Spinner size="sm" />
          Interpretando movimiento…
        </div>
      ) : null}

      {error ? (
        <MovementErrorView error={error} onEdit={handleEdit} />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleInterpret}
          disabled={isPending || !rawText.trim()}
        >
          {isInterpreting ? (
            <>
              <Spinner size="sm" />
              Interpretando…
            </>
          ) : (
            "Interpretar movimiento"
          )}
        </Button>
        {!rawText.trim() ? (
          <Button variant="outline" onClick={handleUseExample}>
            Usar ejemplo
          </Button>
        ) : null}
      </div>
    </div>
  )
}
