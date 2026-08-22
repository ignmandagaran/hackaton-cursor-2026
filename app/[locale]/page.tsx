import { setRequestLocale } from "next-intl/server"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { Wrapper } from "@/components/layout/wrapper"
import { getStockCountOptions } from "@/lib/actions/stock-count"
import { getRecentMovements } from "@/lib/inventory/movements"
import {
  getReconciliationSummary,
  getStockReconciliation,
} from "@/lib/inventory/reconciliation"
import { getCurrentStock } from "@/lib/inventory/stock"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const currentStock = getCurrentStock()
  const recentMovements = getRecentMovements()
  const reconciliation = getStockReconciliation()
  const summary = getReconciliationSummary()
  const countOptions = await getStockCountOptions()

  return (
    <Wrapper>
      <section className="flex grow flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <InventoryDashboard
            summary={summary}
            currentStock={currentStock}
            reconciliation={reconciliation}
            recentMovements={recentMovements}
            countOptions={countOptions}
          />
        </div>
      </section>
    </Wrapper>
  )
}
