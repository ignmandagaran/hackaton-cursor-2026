import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ReconciliationSummary } from "@/lib/inventory/reconciliation"
import { formatKg } from "@/lib/inventory/format-kg"

export function ReconciliationSummaryCards({
  summary,
}: {
  summary: ReconciliationSummary
}) {
  const items = [
    {
      label: "Stock total",
      value: formatKg(summary.totalExpectedKg),
    },
    {
      label: "Lotes con diferencias",
      value: String(summary.discrepancyCount),
    },
    {
      label: "Stock verificado",
      value: formatKg(summary.verifiedKg),
    },
    {
      label: "Sin contar",
      value: formatKg(summary.notCountedKg),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardHeader className="pb-0">
            <CardTitle className="font-normal text-muted-foreground text-xs">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-lg tabular-nums">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
