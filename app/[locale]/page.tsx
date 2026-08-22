import { setRequestLocale } from "next-intl/server"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { Wrapper } from "@/components/layout/wrapper"
import { roundKg } from "@/lib/inventory/kg-tolerance"
import {
  getMovementActivitySince,
  getRecentMovements,
} from "@/lib/inventory/movements"
import { getCurrentStock } from "@/lib/inventory/stock"
import {
  getAllLotStockHistories,
  getDefaultStockHistoryLotId,
  getLotHistoryOptions,
} from "@/lib/inventory/stock-history"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const currentStock = getCurrentStock()
  const recentMovements = getRecentMovements()
  const last24h = getMovementActivitySince(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  )
  const totalKg = roundKg(
    currentStock.reduce(
      (sum, location) =>
        sum + location.lots.reduce((lotSum, lot) => lotSum + lot.quantityKg, 0),
      0
    )
  )
  const lots = getLotHistoryOptions()
  const stockHistories = getAllLotStockHistories()
  const defaultLotId = getDefaultStockHistoryLotId(lots)

  return (
    <Wrapper>
      <section className="flex grow flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-6xl">
          <InventoryDashboard
            currentStock={currentStock}
            recentMovements={recentMovements}
            stats={{
              totalKg,
              locationCount: currentStock.length,
              movementsLast24h: last24h.movementCount,
              movedKgLast24h: last24h.movedKg,
            }}
            lots={lots}
            stockHistories={stockHistories}
            defaultLotId={defaultLotId}
          />
        </div>
      </section>
    </Wrapper>
  )
}
