"use client"

import { CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import type { CreatedMovement } from "@/lib/inventory/types"

function formatKg(value: number): string {
  return `${value.toLocaleString("es-AR")} kg`
}

export function MovementSuccessView({
  result,
  onReset,
}: {
  result: CreatedMovement
  onReset: () => void
}) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6 rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-0.5 size-6 shrink-0 text-green-600" />
        <div>
          <h2 className="font-heading font-medium text-base">
            Movimiento registrado
          </h2>
          <p className="mt-2 text-muted-foreground">
            {formatKg(result.quantityKg)} · lote {result.lotCode}
          </p>
          <p className="font-medium">
            {result.originName} → {result.destinationName}
          </p>
          <p className="mt-2 text-sm">
            Stock restante en {result.originName}:{" "}
            <span className="font-medium">
              {formatKg(result.remainingStock)}
            </span>
          </p>
          <p className="text-sm">
            Stock en {result.destinationName}:{" "}
            <span className="font-medium">
              {formatKg(result.destinationStock)}
            </span>
          </p>
        </div>
      </div>
      <Button variant="outline" onClick={onReset}>
        Registrar otro movimiento
      </Button>
    </div>
  )
}
