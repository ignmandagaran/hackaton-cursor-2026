import { InventoryAttentionPanel } from "@/components/inventory/inventory-attention-panel"
import { StockCountForm } from "@/components/inventory/stock-count-form"
import type { StockCountOption } from "@/lib/actions/stock-count"
import type { StockReconciliation } from "@/lib/inventory/reconciliation"

export function CountsTab({
  lots,
  locations,
  reconciliation,
}: {
  lots: StockCountOption[]
  locations: StockCountOption[]
  reconciliation: StockReconciliation[]
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="mb-4 font-heading font-medium text-lg">
          Registrar conteo físico
        </h2>
        <StockCountForm lots={lots} locations={locations} />
      </section>

      <section>
        <InventoryAttentionPanel entries={reconciliation} />
      </section>
    </div>
  )
}
