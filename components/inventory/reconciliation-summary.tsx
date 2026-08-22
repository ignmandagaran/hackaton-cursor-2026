import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatKg } from "@/lib/inventory/format-kg"

export type InventoryStatusStats = {
  totalKg: number
  locationCount: number
  movementsLast24h: number
  movedKgLast24h: number
}

export function InventoryStatusCards({ stats }: { stats: InventoryStatusStats }) {
  const items = [
    {
      label: "Stock total",
      value: formatKg(stats.totalKg),
    },
    {
      label: "Cantidad de ubicaciones",
      value: String(stats.locationCount),
    },
    {
      label: "Movimientos en las últimas 24 h",
      value: String(stats.movementsLast24h),
    },
    {
      label: "Kilos movidos en las últimas 24 h",
      value: formatKg(stats.movedKgLast24h),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 desktop:grid-cols-4">
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
