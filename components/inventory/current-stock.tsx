import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CurrentStock } from "@/lib/inventory/stock"
import { formatKg } from "@/lib/inventory/format-kg"

export function CurrentStockView({ stock }: { stock: CurrentStock[] }) {
  if (stock.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Sin stock registrado.</p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stock.map((location) => (
        <Card key={location.locationId} size="sm">
          <CardHeader className="pb-0">
            <CardTitle>{location.locationName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {location.lots.map((lot) => (
                <li
                  key={lot.lotId}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="font-medium">Lote {lot.lotCode}</span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {formatKg(lot.quantityKg)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
