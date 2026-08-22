"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  confirmMovement,
  interpretMovement,
  type ConfirmPayload,
} from "@/lib/actions/movement"
import type { CreatedMovement, MovementPreview } from "@/lib/inventory/types"
import { MovementErrorView } from "./movement-error"
import { MovementPreviewView } from "./movement-preview"
import { MovementSuccessView } from "./movement-success"

type Step = "input" | "preview" | "success"

export function MovementForm() {
  const [rawText, setRawText] = useState(
    "Mové 500 kg del lote 224 del Frigorífico 1 al Galpón"
  )
  const [step, setStep] = useState<Step>("input")
  const [preview, setPreview] = useState<MovementPreview | null>(null)
  const [success, setSuccess] = useState<CreatedMovement | null>(null)
  const [error, setError] = useState<{
    message: string
    details?: Record<string, string | number> | undefined
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleInterpret() {
    setError(null)
    startTransition(async () => {
      const result = await interpretMovement(rawText)
      if (!result.ok) {
        setError({
          message: result.error.message,
          details: result.error.details,
        })
        return
      }
      setPreview(result.preview)
      setStep("preview")
    })
  }

  function handleConfirm() {
    if (!preview) return
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
          details: result.error.details,
        })
        return
      }
      setSuccess(result.result)
      setStep("success")
    })
  }

  function handleEdit() {
    setStep("input")
    setPreview(null)
    setError(null)
  }

  function handleReset() {
    setStep("input")
    setPreview(null)
    setSuccess(null)
    setError(null)
  }

  if (step === "success" && success) {
    return <MovementSuccessView result={success} onReset={handleReset} />
  }

  if (step === "preview" && preview) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-4">
        <MovementPreviewView preview={preview} />
        {error ? <MovementErrorView error={error} /> : null}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEdit} disabled={isPending}>
            Editar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Confirmando…" : "Confirmar movimiento"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <label htmlFor="movement-input" className="font-medium text-sm">
        Describí el movimiento en lenguaje natural
      </label>
      <Textarea
        id="movement-input"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        rows={4}
        placeholder="Ej: Mové 500 kg del lote 224 del Frigorífico 1 al Galpón"
      />
      {error ? <MovementErrorView error={error} /> : null}
      <Button onClick={handleInterpret} disabled={isPending || !rawText.trim()}>
        {isPending ? "Interpretando…" : "Interpretar"}
      </Button>
    </div>
  )
}
