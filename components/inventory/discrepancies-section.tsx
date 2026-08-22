import { DiscrepancyDetailDrawer } from "@/components/inventory/discrepancy-detail-drawer"
import type { StockReconciliation } from "@/lib/inventory/reconciliation"
import { formatKg } from "@/lib/inventory/format-kg"
import { cn } from "@/lib/styles/cn"

function formatDifference(value: number): string {
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value.toLocaleString("es-AR")} kg`
}

export function DiscrepanciesSection({
  entries,
  variant = "default",
}: {
  entries: StockReconciliation[]
  variant?: "default" | "panel"
}) {
  const discrepancies = entries.filter((entry) => entry.status === "DISCREPANCY")

  if (discrepancies.length === 0) {
    return (
      <div
        className={cn(
          variant === "panel" &&
            "rounded-4xl bg-card p-4 shadow-md ring-1 ring-foreground/5"
        )}
      >
        <p className="font-medium text-sm">No hay discrepancias detectadas</p>
        <p className="mt-1 text-muted-foreground text-xs">
          Los conteos físicos coinciden con el inventario esperado.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {discrepancies.map((entry) => (
        <li
          key={`${entry.lotId}-${entry.locationId}`}
          className={cn(
            variant === "panel"
              ? "rounded-4xl bg-card px-4 py-3 shadow-md ring-1 ring-foreground/5"
              : "rounded-4xl bg-card px-5 py-4 shadow-md ring-1 ring-foreground/5"
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">
                Lote {entry.lotCode} · {entry.varietyName}
              </p>
              <p className="text-muted-foreground text-sm">
                {entry.locationName}
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground text-xs">Sistema</dt>
                  <dd className="tabular-nums">{formatKg(entry.expectedKg)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">
                    Conteo físico
                  </dt>
                  <dd className="tabular-nums">
                    {entry.countedKg !== null ? formatKg(entry.countedKg) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Diferencia</dt>
                  <dd
                    className={cn(
                      "tabular-nums",
                      entry.differenceKg !== null &&
                        entry.differenceKg < 0 &&
                        "text-amber-700 dark:text-amber-400",
                      entry.differenceKg !== null &&
                        entry.differenceKg > 0 &&
                        "text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {entry.differenceKg !== null
                      ? formatDifference(entry.differenceKg)
                      : "—"}
                  </dd>
                </div>
              </dl>
              {variant === "default" ? (
                <p className="mt-2 text-muted-foreground text-xs">
                  Diferencia calculada desde inventario
                </p>
              ) : null}
            </div>
            <DiscrepancyDetailDrawer
              lotId={entry.lotId}
              locationId={entry.locationId}
              lotCode={entry.lotCode}
              locationName={entry.locationName}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
