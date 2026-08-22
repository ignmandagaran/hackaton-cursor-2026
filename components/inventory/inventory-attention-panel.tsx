import type { ReactNode } from "react"
import { DiscrepancyDetailDrawer } from "@/components/inventory/discrepancy-detail-drawer"
import type { StockReconciliation } from "@/lib/inventory/reconciliation"
import { formatKg } from "@/lib/inventory/format-kg"

function AttentionList({
  title,
  items,
  emptyMessage,
  renderItem,
}: {
  title: string
  items: StockReconciliation[]
  emptyMessage: string
  renderItem: (entry: StockReconciliation) => ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 font-medium text-sm">{title}</h3>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-xs">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((entry) => (
            <li
              key={`${entry.lotId}-${entry.locationId}`}
              className="border-border/60 border-b pb-2 last:border-0 last:pb-0"
            >
              {renderItem(entry)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function InventoryAttentionPanel({
  entries,
}: {
  entries: StockReconciliation[]
}) {
  const notCounted = entries.filter((entry) => entry.status === "NOT_COUNTED")
  const discrepancies = entries.filter(
    (entry) => entry.status === "DISCREPANCY"
  )
  const verified = entries.filter((entry) => entry.status === "VERIFIED")

  return (
    <div className="rounded-4xl bg-card p-5 shadow-md ring-1 ring-foreground/5">
      <h2 className="mb-4 font-heading font-medium text-lg">
        Inventario que requiere atención
      </h2>
      <div className="flex flex-col gap-5">
        <AttentionList
          title="Sin contar"
          items={notCounted}
          emptyMessage="Todos los lotes tienen conteo registrado."
          renderItem={(entry) => (
            <div>
              <p className="text-sm">
                Lote {entry.lotCode} · {entry.varietyName}
              </p>
              <p className="text-muted-foreground text-xs">
                {entry.locationName} · {formatKg(entry.expectedKg)}
              </p>
            </div>
          )}
        />

        <AttentionList
          title="Discrepancias"
          items={discrepancies}
          emptyMessage="No hay diferencias detectadas."
          renderItem={(entry) => (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm">
                  Lote {entry.lotCode} · {entry.varietyName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {entry.locationName}
                </p>
                {entry.differenceKg !== null && (
                  <p className="mt-1 text-amber-700 text-xs tabular-nums dark:text-amber-400">
                    {entry.differenceKg > 0 ? "+" : ""}
                    {entry.differenceKg.toLocaleString("es-AR")} kg
                  </p>
                )}
              </div>
              <DiscrepancyDetailDrawer
                lotId={entry.lotId}
                locationId={entry.locationId}
                lotCode={entry.lotCode}
                locationName={entry.locationName}
              />
            </div>
          )}
        />

        <AttentionList
          title="Verificados recientemente"
          items={verified}
          emptyMessage="Aún no hay lotes verificados."
          renderItem={(entry) => (
            <div>
              <p className="text-sm">
                Lote {entry.lotCode} · {entry.varietyName}
              </p>
              <p className="text-muted-foreground text-xs">
                {entry.locationName} · {formatKg(entry.expectedKg)}
              </p>
            </div>
          )}
        />
      </div>
    </div>
  )
}
