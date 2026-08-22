"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "@/i18n/navigation"
import {
  confirmCount,
  confirmMovement,
  interpretInventoryOperation,
  previewCountAtLocation,
  previewPendingTransfer,
  type ConfirmPayload,
} from "@/lib/actions/movement"
import { useSpeechRecognition } from "@/lib/hooks/use-speech-recognition"
import type {
  ConfirmedCount,
  CountLocationChoice,
  CountPreview,
  CreatedMovement,
  MovementError,
  MovementPreview,
  PendingTransfer,
} from "@/lib/inventory/types"
import { cn } from "@/lib/styles/cn"
import { CountCorrectionView } from "./count-correction"
import { CountLocationChoiceView } from "./count-location-choice"
import { CountPreviewView } from "./count-preview"
import { CountSuccessView } from "./count-success"
import { InsufficientStockView } from "./insufficient-stock"
import { MovementErrorView } from "./movement-error"
import { MovementPreviewView } from "./movement-preview"
import { MovementSuccessView } from "./movement-success"
import { PendingTransferReadyView } from "./pending-transfer-ready"
import {
  VoiceErrorMessage,
  VoiceInputButton,
  VoiceListeningStatus,
} from "./voice-input-button"

const TRANSFER_EXAMPLE =
  "Mové 200 kg del lote 224 del Frigorífico 1 al Galpón"
const COUNT_EXAMPLE = "Conté 250 kg del lote 224 en el Frigorífico 1"

type Step =
  | "input"
  | "preview-transfer"
  | "preview-count"
  | "choose-location"
  | "insufficient"
  | "count-correction"
  | "count-success"
  | "transfer-success"
  | "pending-ready"

type FormError = Pick<MovementError, "message" | "details"> & {
  code?: MovementError["code"]
}

type InputSource = "main" | "correction"

export function MovementForm() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [rawText, setRawText] = useState("")
  const [correctionText, setCorrectionText] = useState("")
  const [step, setStep] = useState<Step>("input")
  const [inputSource, setInputSource] = useState<InputSource>("main")
  const [transferPreview, setTransferPreview] = useState<MovementPreview | null>(
    null
  )
  const [countPreview, setCountPreview] = useState<CountPreview | null>(null)
  const [locationChoice, setLocationChoice] =
    useState<CountLocationChoice | null>(null)
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(
    null
  )
  const [availableKg, setAvailableKg] = useState(0)
  const [countSuccess, setCountSuccess] = useState<ConfirmedCount | null>(null)
  const [transferSuccess, setTransferSuccess] =
    useState<CreatedMovement | null>(null)
  const [error, setError] = useState<FormError | null>(null)
  const [isPending, startTransition] = useTransition()
  const {
    isSupported: isVoiceSupported,
    isListening,
    interimTranscript,
    voiceError,
    clearVoiceError,
    toggleListening,
  } = useSpeechRecognition()

  const isInterpreting =
    (step === "input" || step === "count-correction") && isPending
  const isConfirming =
    (step === "preview-transfer" || step === "preview-count") && isPending

  function applyInsufficient(pending: PendingTransfer, available: number) {
    setPendingTransfer(pending)
    setAvailableKg(available)
    setTransferPreview(null)
    setStep("insufficient")
  }

  function handleInterpretResult(
    result: Awaited<ReturnType<typeof interpretInventoryOperation>>
  ) {
    if (!result.ok) {
      if (result.error.code === "INSUFFICIENT_STOCK" && result.pendingTransfer) {
        applyInsufficient(
          result.pendingTransfer,
          Number(result.error.details?.available ?? 0)
        )
        setError(null)
        return
      }
      setError({
        message: result.error.message,
        code: result.error.code,
        details: result.error.details,
      })
      return
    }

    setError(null)

    if (result.kind === "TRANSFER") {
      setTransferPreview(result.preview)
      setStep("preview-transfer")
      return
    }

    if (result.kind === "COUNT") {
      setCountPreview(result.preview)
      setStep("preview-count")
      return
    }

    setLocationChoice(result.choice)
    setStep("choose-location")
  }

  function handleInterpret() {
    if (!rawText.trim() || isPending) return
    setError(null)
    setInputSource("main")
    startTransition(async () => {
      const result = await interpretInventoryOperation(rawText)
      handleInterpretResult(result)
    })
  }

  function handleCorrectionInterpret() {
    if (!pendingTransfer || !correctionText.trim() || isPending) return
    setError(null)
    setInputSource("correction")
    startTransition(async () => {
      const result = await interpretInventoryOperation(correctionText, {
        expectedType: "COUNT",
        lotCode: pendingTransfer.lotCode,
        locationName: pendingTransfer.originName,
      })
      handleInterpretResult(result)
    })
  }

  function handleSelectCountLocation(locationId: number) {
    if (!locationChoice || isPending) return
    setError(null)
    startTransition(async () => {
      const result = await previewCountAtLocation({
        lotId: locationChoice.lotId,
        lotCode: locationChoice.lotCode,
        varietyName: locationChoice.varietyName,
        locationId,
        countedKg: locationChoice.countedKg,
        rawInput: locationChoice.rawInput,
        notes: locationChoice.notes,
      })
      handleInterpretResult(result)
    })
  }

  function handleConfirmTransfer() {
    if (!transferPreview || isPending) return
    setError(null)

    const payload: ConfirmPayload = {
      lotId: transferPreview.lotId,
      lotCode: transferPreview.lotCode,
      quantityKg: transferPreview.quantityKg,
      originId: transferPreview.originId,
      originName: transferPreview.originName,
      destinationId: transferPreview.destinationId,
      destinationName: transferPreview.destinationName,
      varietyName: transferPreview.varietyName,
      availableStock: transferPreview.availableStock,
      stockAfter: transferPreview.stockAfter,
      rawInput: transferPreview.rawInput,
      notes: transferPreview.notes,
    }

    startTransition(async () => {
      const result = await confirmMovement(payload)
      if (!result.ok) {
        if (result.error.code === "INSUFFICIENT_STOCK" && result.pendingTransfer) {
          applyInsufficient(
            result.pendingTransfer,
            Number(result.error.details?.available ?? 0)
          )
          return
        }
        setError({
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
        })
        return
      }
      setTransferSuccess(result.result)
      setPendingTransfer(null)
      setStep("transfer-success")
      router.refresh()
    })
  }

  function handleConfirmCount() {
    if (!countPreview || isPending) return
    setError(null)

    startTransition(async () => {
      const result = await confirmCount({
        lotId: countPreview.lotId,
        lotCode: countPreview.lotCode,
        varietyName: countPreview.varietyName,
        locationId: countPreview.locationId,
        locationName: countPreview.locationName,
        countedKg: countPreview.countedKg,
        rawInput: countPreview.rawInput,
        notes: countPreview.notes,
      })

      if (!result.ok) {
        setError({
          message: result.error.message,
          code: result.error.code,
          details: result.error.details,
        })
        return
      }

      setCountSuccess(result.result)
      router.refresh()

      if (pendingTransfer) {
        const next = await previewPendingTransfer(pendingTransfer)
        if (next.ok && next.kind === "TRANSFER") {
          setTransferPreview(next.preview)
          setStep("pending-ready")
          return
        }
        if (!next.ok && next.error.code === "INSUFFICIENT_STOCK" && next.pendingTransfer) {
          applyInsufficient(
            next.pendingTransfer,
            Number(next.error.details?.available ?? result.result.resultingKg)
          )
          return
        }
      }

      setStep("count-success")
    })
  }

  function handleEditPending() {
    setError(null)
    setTransferPreview(null)
    setCountPreview(null)
    setLocationChoice(null)
    if (pendingTransfer) {
      setRawText(pendingTransfer.rawInput)
    }
    setPendingTransfer(null)
    setInputSource("main")
    setStep("input")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleContinuePending() {
    if (!transferPreview) return
    setInputSource("main")
    setStep("preview-transfer")
  }

  function handleEdit() {
    setError(null)
    setTransferPreview(null)
    setCountPreview(null)
    setLocationChoice(null)
    if (inputSource === "correction" && pendingTransfer) {
      setStep("count-correction")
      return
    }
    setStep("input")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleReset() {
    setStep("input")
    setInputSource("main")
    setTransferPreview(null)
    setCountPreview(null)
    setLocationChoice(null)
    setPendingTransfer(null)
    setCountSuccess(null)
    setTransferSuccess(null)
    setError(null)
    setRawText("")
    setCorrectionText("")
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleUseExample(example: string) {
    setRawText(example)
    setError(null)
    textareaRef.current?.focus()
  }

  function handleVoiceInput() {
    if (isInterpreting) return
    clearVoiceError()
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

  if (step === "transfer-success" && transferSuccess) {
    return (
      <MovementSuccessView result={transferSuccess} onReset={handleReset} />
    )
  }

  if (step === "count-success" && countSuccess) {
    return <CountSuccessView result={countSuccess} onReset={handleReset} />
  }

  if (step === "pending-ready" && countSuccess && pendingTransfer) {
    return (
      <PendingTransferReadyView
        count={countSuccess}
        pending={pendingTransfer}
        onContinue={handleContinuePending}
        onReset={handleReset}
      />
    )
  }

  if (step === "insufficient" && pendingTransfer) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <InsufficientStockView
          pending={pendingTransfer}
          availableKg={availableKg}
          onCount={() => {
            setError(null)
            setCorrectionText("")
            setInputSource("correction")
            setStep("count-correction")
          }}
          onEdit={handleEditPending}
        />
      </div>
    )
  }

  if (step === "count-correction" && pendingTransfer) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <CountCorrectionView
          pending={pendingTransfer}
          availableKg={availableKg}
          text={correctionText}
          onTextChange={setCorrectionText}
          onSubmit={handleCorrectionInterpret}
          onBack={() => setStep("insufficient")}
          isPending={isPending}
        />
        {error ? <MovementErrorView error={error} onEdit={handleEdit} /> : null}
      </div>
    )
  }

  if (step === "choose-location" && locationChoice) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <CountLocationChoiceView
          choice={locationChoice}
          onSelect={handleSelectCountLocation}
          onEdit={handleEdit}
        />
        {error ? <MovementErrorView error={error} /> : null}
      </div>
    )
  }

  if (step === "preview-count" && countPreview) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <CountPreviewView preview={countPreview} />
        {error ? (
          <MovementErrorView error={error} onEdit={handleEdit} />
        ) : null}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEdit} disabled={isPending}>
            Editar
          </Button>
          <Button onClick={handleConfirmCount} disabled={isPending}>
            {isConfirming ? (
              <>
                <Spinner size="sm" />
                Registrando conteo…
              </>
            ) : (
              "Confirmar conteo"
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (step === "preview-transfer" && transferPreview) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <MovementPreviewView preview={transferPreview} />
        {error ? (
          <MovementErrorView error={error} onEdit={handleEdit} />
        ) : null}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEdit} disabled={isPending}>
            Editar
          </Button>
          <Button onClick={handleConfirmTransfer} disabled={isPending}>
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
          ¿Qué ocurrió con el stock?
        </label>
        <p className="mt-1 text-muted-foreground text-xs">
          Describí un movimiento o conteo en tus palabras.
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          Ejemplos:{" "}
          <button
            type="button"
            onClick={() => handleUseExample(TRANSFER_EXAMPLE)}
            className="text-left underline-offset-2 hover:underline"
          >
            &ldquo;{TRANSFER_EXAMPLE}&rdquo;
          </button>
          {" · "}
          <button
            type="button"
            onClick={() => handleUseExample(COUNT_EXAMPLE)}
            className="text-left underline-offset-2 hover:underline"
          >
            &ldquo;{COUNT_EXAMPLE}&rdquo;
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
          placeholder={TRANSFER_EXAMPLE}
        />
        {isVoiceSupported ? (
          <InputGroupAddon align="inline-end" className="self-end pb-2">
            <VoiceInputButton
              isListening={isListening}
              disabled={isInterpreting}
              onClick={handleVoiceInput}
            />
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {isListening ? (
        <VoiceListeningStatus interimTranscript={interimTranscript} />
      ) : null}

      {voiceError ? <VoiceErrorMessage message={voiceError} /> : null}

      {isInterpreting ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Spinner size="sm" />
          Interpretando operación…
        </div>
      ) : null}

      {error ? <MovementErrorView error={error} onEdit={handleEdit} /> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleInterpret} disabled={isPending || !rawText.trim()}>
          {isInterpreting ? (
            <>
              <Spinner size="sm" />
              Interpretando…
            </>
          ) : (
            "Interpretar"
          )}
        </Button>
        {!rawText.trim() ? (
          <Button
            variant="outline"
            onClick={() => handleUseExample(TRANSFER_EXAMPLE)}
          >
            Usar ejemplo
          </Button>
        ) : null}
      </div>
    </div>
  )
}
