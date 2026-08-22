import { getTranslations, setRequestLocale } from "next-intl/server"
import { CurrentStockView } from "@/components/inventory/current-stock"
import { DiscrepanciesSection } from "@/components/inventory/discrepancies-section"
import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { ReconciliationSummaryCards } from "@/components/inventory/reconciliation-summary"
import { StockCountForm } from "@/components/inventory/stock-count-form"
import { Wrapper } from "@/components/layout/wrapper"
import { Link } from "@/components/ui/link"
import { MovementForm } from "@/components/movement/movement-form"
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
  const t = await getTranslations("home")
  const tMovements = await getTranslations("movements")

  const currentStock = getCurrentStock()
  const recentMovements = getRecentMovements()
  const reconciliation = getStockReconciliation()
  const summary = getReconciliationSummary()
  const countOptions = await getStockCountOptions()

  return (
    <Wrapper>
      <section className="flex grow flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-xl flex-col gap-12">
          <div>
            <div className="mb-8 text-center">
              <h1 className="font-heading font-medium text-2xl">
                {t("movementTitle")}
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                {t("movementSubtitle")}
              </p>
            </div>
            <MovementForm />
          </div>

          <div>
            <h2 className="mb-4 font-heading font-medium text-xl">
              {t("inventoryStatusTitle")}
            </h2>
            <ReconciliationSummaryCards summary={summary} />
          </div>

          <div>
            <h2 className="mb-4 font-heading font-medium text-xl">
              {t("currentStockTitle")}
            </h2>
            <CurrentStockView
              stock={currentStock}
              reconciliation={reconciliation}
            />
          </div>

          <div>
            <h2 className="mb-4 font-heading font-medium text-xl">
              {t("discrepanciesTitle")}
            </h2>
            <DiscrepanciesSection entries={reconciliation} />
          </div>

          <div>
            <h2 className="mb-4 font-heading font-medium text-xl">
              {t("registerCountTitle")}
            </h2>
            <StockCountForm
              lots={countOptions.lots}
              locations={countOptions.locations}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-heading font-medium text-xl">
                {t("recentMovementsTitle")}
              </h2>
              <Link
                href="/movements"
                className="text-muted-foreground text-sm underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("viewAllMovements")}
              </Link>
            </div>
            <RecentMovementsView
              movements={recentMovements}
              emptyMessage={tMovements("empty")}
              deletedLabel={tMovements("deleted")}
              locale={locale}
            />
          </div>
        </div>
      </section>
    </Wrapper>
  )
}
