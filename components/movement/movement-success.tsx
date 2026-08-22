"use client"

import { ArrowDown, CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { formatKg } from "@/lib/inventory/format-kg"
import type { CreatedMovement } from "@/lib/inventory/types"

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
        <CheckCircle
          className="mt-0.5 size-6 shrink-0 text-green-600 dark:text-green-500"
          weight="fill"
        />
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-heading font-medium text-base">
              Movimiento registrado
            </h2>
            <p className="mt-1 text-muted-foreground">
              {formatKg(result.quantityKg)} · Lote {result.lotCode}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="font-medium">{result.originName}</p>
            <ArrowDown className="size-4 text-muted-foreground" />
            <p className="font-medium">{result.destinationName}</p>
          </div>

          <p className="text-sm">
            Stock restante en {result.originName}:{" "}
            <span className="font-medium tabular-nums">
              {formatKg(result.remainingStock)}
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
