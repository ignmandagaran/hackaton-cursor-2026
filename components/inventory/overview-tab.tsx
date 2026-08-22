import { CurrentStockView } from "@/components/inventory/current-stock"
import {
  InventoryStatusCards,
  type InventoryStatusStats,
} from "@/components/inventory/reconciliation-summary"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import type { CurrentStock } from "@/lib/inventory/stock"
import type { RecentMovement } from "@/lib/inventory/movements"

type OverviewTabProps = {
  stock: CurrentStock[]
  recentMovements: RecentMovement[]
  stats: InventoryStatusStats
}

export function OverviewTab({
  stock,
  recentMovements,
  stats,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 font-heading font-medium text-lg">
          Estado de inventario
        </h2>
        <InventoryStatusCards stats={stats} />
      </section>

      <section>
        <h2 className="mb-3 font-heading font-medium text-lg">
          Stock por ubicación
        </h2>
        <CurrentStockView stock={stock} />
      </section>

      <section>
        <RecentMovementsView
          movements={recentMovements}
          limit={5}
          showHeader
          viewAllHref="/movements"
          compact
        />
      </section>
    </div>
  )
}
