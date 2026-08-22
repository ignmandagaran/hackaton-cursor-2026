import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LotLink } from "@/components/inventory/lot-link"
import type { CurrentStock } from "@/lib/inventory/stock"
import type { StockReconciliation } from "@/lib/inventory/reconciliation"
import { formatKg } from "@/lib/inventory/format-kg"

function ReconciliationBadge({ status }: { status: StockReconciliation["status"] }) {
  if (status === "VERIFIED") {
    return (
      <span className="text-emerald-700 text-xs dark:text-emerald-400">
        ✓ Verificado
      </span>
    )
  }

  if (status === "DISCREPANCY") {
    return (
      <span className="text-amber-700 text-xs dark:text-amber-400">
        ⚠ Diferencia
      </span>
    )
  }

  return (
    <span className="text-muted-foreground text-xs">Sin contar</span>
  )
}

function LocationStatusSummary({
  entries,
}: {
  entries: StockReconciliation[]
}) {
  const verified = entries.filter((entry) => entry.status === "VERIFIED").length
  const discrepancies = entries.filter(
    (entry) => entry.status === "DISCREPANCY"
  ).length
  const notCounted = entries.filter(
    (entry) => entry.status === "NOT_COUNTED"
  ).length

  const parts: string[] = []
  if (verified > 0) parts.push(`✓ ${verified} verificado${verified === 1 ? "" : "s"}`)
  if (discrepancies > 0) {
    parts.push(
      `⚠ ${discrepancies} con diferencia${discrepancies === 1 ? "" : "s"}`
    )
  }
  if (notCounted > 0) {
    parts.push(`${notCounted} sin contar`)
  }

  if (parts.length === 0) return null

  return (
    <p className="text-muted-foreground text-xs">{parts.join(" · ")}</p>
  )
}

export function CurrentStockView({
  stock,
  reconciliation,
}: {
  stock: CurrentStock[]
  reconciliation: StockReconciliation[]
}) {
  if (stock.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Sin stock registrado.</p>
    )
  }

  const reconciliationByKey = new Map(
    reconciliation.map((entry) => [
      `${entry.lotId}-${entry.locationId}`,
      entry,
    ])
  )

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
      {stock.map((location) => {
        const locationEntries = reconciliation.filter(
          (entry) => entry.locationId === location.locationId
        )
        const totalKg = location.lots.reduce(
          (sum, lot) => sum + lot.quantityKg,
          0
        )

        return (
          <Card key={location.locationId} size="sm">
            <CardHeader className="pb-0">
              <CardTitle>{location.locationName}</CardTitle>
              <p className="text-muted-foreground text-sm tabular-nums">
                {formatKg(totalKg)}
              </p>
              <LocationStatusSummary entries={locationEntries} />
            </CardHeader>
            <CardContent className="pt-3">
              <ul className="flex flex-col gap-1.5">
                {location.lots.map((lot) => {
                  const entry = reconciliationByKey.get(
                    `${lot.lotId}-${location.locationId}`
                  )

                  return (
                    <li
                      key={lot.lotId}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <LotLink lotId={lot.lotId} lotCode={lot.lotCode} />
                        <span className="text-muted-foreground text-xs">
                          {lot.varietyName}
                        </span>
                        {entry && entry.status !== "NOT_COUNTED" && (
                          <span className="text-muted-foreground text-xs tabular-nums">
                            Contado:{" "}
                            {entry.countedKg !== null
                              ? formatKg(entry.countedKg)
                              : "—"}
                          </span>
                        )}
                        {entry && (
                          <ReconciliationBadge status={entry.status} />
                        )}
                      </div>
                      <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
                        {formatKg(lot.quantityKg)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
