import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LotLink } from "@/components/inventory/lot-link"
import type { CurrentStock } from "@/lib/inventory/stock"
import { formatKg } from "@/lib/inventory/format-kg"

export function CurrentStockView({ stock }: { stock: CurrentStock[] }) {
  if (stock.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Sin stock registrado.</p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
      {stock.map((location) => {
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
            </CardHeader>
            <CardContent className="pt-3">
              <ul className="flex flex-col gap-1.5">
                {location.lots.map((lot) => (
                  <li
                    key={lot.lotId}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <LotLink lotId={lot.lotId} lotCode={lot.lotCode} />
                      <span className="text-muted-foreground text-xs">
                        {lot.varietyName}
                      </span>
                    </div>
                    <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
                      {formatKg(lot.quantityKg)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
