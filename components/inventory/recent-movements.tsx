"use client"

import { LotLink } from "@/components/inventory/lot-link"
import { MovementDeleteButton } from "@/components/inventory/movement-delete-button"
import { RelativeTime } from "@/components/inventory/relative-time"
import { Button } from "@/components/ui/button"
import { Link } from "@/components/ui/link"
import { formatKg, formatSignedKg } from "@/lib/inventory/format-kg"
import { adjustmentSign, formatRoute } from "@/lib/inventory/format-route"
import type { RecentMovement } from "@/lib/inventory/movements"
import { cn } from "@/lib/styles/cn"
import { useLocale, useTranslations } from "next-intl"

function formatQuantity(movement: RecentMovement) {
  if (movement.type === "ADJUSTMENT") {
    const sign = adjustmentSign(movement.originName, movement.destinationName)
    return formatSignedKg(sign * movement.quantityKg)
  }
  return formatKg(movement.quantityKg)
}

export function RecentMovementsView({
  movements,
  emptyMessage,
  deletedLabel,
  locale,
  limit,
  showHeader = false,
  onViewAll,
  viewAllHref,
  compact = false,
}: {
  movements: RecentMovement[]
  emptyMessage?: string
  deletedLabel?: string
  locale?: string | undefined
  limit?: number
  showHeader?: boolean
  onViewAll?: () => void
  viewAllHref?: string
  compact?: boolean
}) {
  const activeLocale = useLocale()
  const tHome = useTranslations("home")
  const tMovements = useTranslations("movements")
  const resolvedLocale = locale ?? activeLocale
  const resolvedEmpty = emptyMessage ?? tMovements("empty")
  const resolvedDeleted = deletedLabel ?? tMovements("deleted")

  const visibleMovements =
    limit !== undefined ? movements.slice(0, limit) : movements

  const viewAllControl = viewAllHref ? (
    <Link
      href={viewAllHref}
      className="text-muted-foreground text-sm underline-offset-2 hover:text-foreground hover:underline"
    >
      {tHome("viewAllMovements")} →
    </Link>
  ) : onViewAll ? (
    <Button
      type="button"
      variant="link"
      size="sm"
      className="h-auto px-0 text-muted-foreground"
      onClick={onViewAll}
    >
      {tHome("viewAllMovements")} →
    </Button>
  ) : null

  const header = showHeader ? (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-heading font-medium text-lg">
        {tHome("recentMovementsTitle")}
      </h2>
      {viewAllControl}
    </div>
  ) : null

  if (movements.length === 0) {
    return (
      <div>
        {header}
        <p className="text-muted-foreground text-sm">{resolvedEmpty}</p>
      </div>
    )
  }

  return (
    <div>
      {header}
      <ul className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
        {visibleMovements.map((movement) => {
          const isDeleted = movement.deletedAt !== null

          return (
            <li
              key={movement.id}
              className={cn(
                compact
                  ? "border-border/60 border-b py-2 last:border-0"
                  : "rounded-4xl bg-card px-5 py-4 shadow-md ring-1 ring-foreground/5",
                isDeleted && "opacity-70"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      compact ? "text-sm" : "font-medium",
                      isDeleted && "text-muted-foreground line-through"
                    )}
                  >
                    {formatQuantity(movement)} ·{" "}
                    <LotLink lotId={movement.lotId} lotCode={movement.lotCode} />
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-sm">
                    {formatRoute(movement)}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs">
                    <RelativeTime
                      isoDate={movement.createdAt}
                      locale={resolvedLocale}
                    />
                  </p>
                  {isDeleted && movement.deletedAt ? (
                    <p className="mt-0.5 text-destructive text-xs">
                      {resolvedDeleted} ·{" "}
                      <RelativeTime
                        isoDate={movement.deletedAt}
                        locale={resolvedLocale}
                      />
                    </p>
                  ) : null}
                </div>
                <MovementDeleteButton movement={movement} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
