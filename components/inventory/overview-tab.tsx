import { CurrentStockView } from "@/components/inventory/current-stock"
import {
  InventoryStatusCards,
  type InventoryStatusStats,
} from "@/components/inventory/reconciliation-summary"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { StockHistoryChart } from "@/components/inventory/stock-history-chart"
import type { CurrentStock } from "@/lib/inventory/stock"
import type { RecentMovement } from "@/lib/inventory/movements"
import type {
  LotHistoryOption,
  LotStockHistory,
} from "@/lib/inventory/stock-history"

type OverviewTabProps = {
  stock: CurrentStock[]
  recentMovements: RecentMovement[]
  stats: InventoryStatusStats
  lots: LotHistoryOption[]
  stockHistories: LotStockHistory[]
  defaultLotId: number | null
}

export function OverviewTab({
  stock,
  recentMovements,
  stats,
  lots,
  stockHistories,
  defaultLotId,
}: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 font-heading font-medium text-lg">
          Estado de inventario
        </h2>
        <InventoryStatusCards stats={stats} />
      </section>

      <StockHistoryChart
        lots={lots}
        histories={stockHistories}
        defaultLotId={defaultLotId}
      />

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
