import { CurrentStockView } from "@/components/inventory/current-stock"
import { DiscrepanciesSection } from "@/components/inventory/discrepancies-section"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { ReconciliationSummaryCards } from "@/components/inventory/reconciliation-summary"
import { StockHistoryChart } from "@/components/inventory/stock-history-chart"
import type { CurrentStock } from "@/lib/inventory/stock"
import type { RecentMovement } from "@/lib/inventory/movements"
import type {
  ReconciliationSummary,
  StockReconciliation,
} from "@/lib/inventory/reconciliation"
import type {
  LotHistoryOption,
  LotStockHistory,
} from "@/lib/inventory/stock-history"

type OverviewTabProps = {
  summary: ReconciliationSummary
  stock: CurrentStock[]
  reconciliation: StockReconciliation[]
  recentMovements: RecentMovement[]
  lots: LotHistoryOption[]
  stockHistories: LotStockHistory[]
  defaultLotId: number | null
}

export function OverviewTab({
  summary,
  stock,
  reconciliation,
  recentMovements,
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
        <ReconciliationSummaryCards summary={summary} />
      </section>

      <StockHistoryChart
        lots={lots}
        histories={stockHistories}
        defaultLotId={defaultLotId}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <section>
          <h2 className="mb-3 font-heading font-medium text-lg">
            Stock por ubicación
          </h2>
          <CurrentStockView stock={stock} reconciliation={reconciliation} />
        </section>

        <section>
          <h2 className="mb-3 font-heading font-medium text-lg">
            Discrepancias
          </h2>
          <DiscrepanciesSection entries={reconciliation} variant="panel" />
        </section>
      </div>

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
