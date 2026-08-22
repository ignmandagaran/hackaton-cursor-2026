"use client"

import { CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { formatKg } from "@/lib/inventory/format-kg"
import type { ConfirmedCount, PendingTransfer } from "@/lib/inventory/types"

export function PendingTransferReadyView({
  count,
  pending,
  onContinue,
  onReset,
}: {
  count: ConfirmedCount
  pending: PendingTransfer
  onContinue: () => void
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
              Stock actualizado
            </h2>
            <p className="mt-1 text-muted-foreground">
              Ahora hay{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatKg(count.resultingKg)}
              </span>{" "}
              disponibles en {count.locationName}.
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Tu movimiento pendiente
            </p>
            <p className="mt-1 font-medium">
              {formatKg(pending.quantityKg)} · Lote {pending.lotCode}
            </p>
            <p className="text-muted-foreground text-sm">
              {pending.originName} → {pending.destinationName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onContinue}>Continuar movimiento</Button>
        <Button variant="outline" onClick={onReset}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
