"use client"

import { useRouter } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  registerStockCount,
  type StockCountOption,
} from "@/lib/actions/stock-count"
import { Spinner } from "@/components/ui/spinner"

export function StockCountForm({
  lots,
  locations,
}: {
  lots: StockCountOption[]
  locations: StockCountOption[]
}) {
  const router = useRouter()
  const [lotId, setLotId] = useState<string>("")
  const [locationId, setLocationId] = useState<string>("")
  const [quantityKg, setQuantityKg] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const parsedQty = Number.parseFloat(quantityKg.replace(",", "."))
    if (!lotId || !locationId) {
      setError("Seleccioná lote y ubicación.")
      return
    }

    startTransition(async () => {
      const result = await registerStockCount({
        lotId: Number.parseInt(lotId, 10),
        locationId: Number.parseInt(locationId, 10),
        quantityKg: parsedQty,
        notes: notes.trim() || undefined,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setQuantityKg("")
      setNotes("")
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-4xl bg-card p-5 shadow-md ring-1 ring-foreground/5"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="count-lot">Lote</Label>
          <Select value={lotId} onValueChange={setLotId}>
            <SelectTrigger id="count-lot" className="w-full">
              <SelectValue placeholder="Seleccionar lote" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot.id} value={String(lot.id)}>
                  {lot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="count-location">Ubicación</Label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger id="count-location" className="w-full">
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="count-quantity">Cantidad física (kg)</Label>
          <Input
            id="count-quantity"
            inputMode="decimal"
            placeholder="720"
            value={quantityKg}
            onChange={(event) => setQuantityKg(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="count-notes">Notas (opcional)</Label>
          <Textarea
            id="count-notes"
            rows={2}
            placeholder="Conteo de fin de turno"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-muted-foreground text-sm">
            Conteo registrado correctamente.
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Spinner className="size-4" />
              Registrando…
            </>
          ) : (
            "Registrar conteo"
          )}
        </Button>
      </div>
    </form>
  )
}
