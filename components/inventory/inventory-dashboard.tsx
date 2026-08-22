"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryStatusStats } from "@/components/inventory/reconciliation-summary"
import type { CurrentStock } from "@/lib/inventory/stock"
import type { RecentMovement } from "@/lib/inventory/movements"
import { OverviewTab } from "./overview-tab"
import { MovementsTab } from "./movements-tab"

type InventoryDashboardProps = {
  currentStock: CurrentStock[]
  recentMovements: RecentMovement[]
  stats: InventoryStatusStats
}

export function InventoryDashboard({
  currentStock,
  recentMovements,
  stats,
}: InventoryDashboardProps) {
  const t = useTranslations("home")
  const [tab, setTab] = useState("overview")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading font-medium text-2xl">{t("inventoryTitle")}</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="w-full sm:w-auto">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="operations">{t("tabOperations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            stock={currentStock}
            recentMovements={recentMovements}
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <MovementsTab movements={recentMovements} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
