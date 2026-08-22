"use client"

import { CheckCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { formatKg, formatSignedKg } from "@/lib/inventory/format-kg"
import type { ConfirmedCount } from "@/lib/inventory/types"

export function CountSuccessView({
  result,
  onReset,
}: {
  result: ConfirmedCount
  onReset: () => void
}) {
  const reconciled = result.differenceKg !== 0

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
      <div className="flex items-start gap-3">
        <CheckCircle
          className="mt-0.5 size-6 shrink-0 text-green-600 dark:text-green-500"
          weight="fill"
        />
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="font-heading font-medium text-base">
              {reconciled ? "Inventario conciliado" : "Conteo registrado"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              Lote {result.lotCode} · {result.varietyName}
            </p>
            <p className="text-muted-foreground">{result.locationName}</p>
          </div>

          {reconciled ? (
            <>
              <p className="font-medium tabular-nums">
                {formatKg(result.expectedKg)} → {formatKg(result.countedKg)}
              </p>
              <p className="text-sm">
                Ajuste registrado{" "}
                <span className="font-medium tabular-nums">
                  {formatSignedKg(result.differenceKg)}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="font-medium tabular-nums">
                {formatKg(result.countedKg)}
              </p>
              <p className="text-sm text-muted-foreground">
                El conteo coincide con el sistema.
              </p>
            </>
          )}
        </div>
      </div>

      <Button variant="outline" onClick={onReset}>
        Registrar otra operación
      </Button>
    </div>
  )
}
