"use client"

import { LotLink } from "@/components/inventory/lot-link"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/inventory/format-relative-time"
import { formatKg } from "@/lib/inventory/format-kg"
import { formatRoute } from "@/lib/inventory/format-route"
import type { RecentMovement } from "@/lib/inventory/movements"
import { cn } from "@/lib/styles/cn"

export function RecentMovementsView({
  movements,
  limit,
  showHeader = false,
  onViewAll,
  compact = false,
}: {
  movements: RecentMovement[]
  limit?: number
  showHeader?: boolean
  onViewAll?: () => void
  compact?: boolean
}) {
  const visibleMovements =
    limit !== undefined ? movements.slice(0, limit) : movements

  if (movements.length === 0) {
    return (
      <div>
        {showHeader ? (
          <h2 className="mb-3 font-heading font-medium text-lg">
            Últimos movimientos
          </h2>
        ) : null}
        <p className="text-muted-foreground text-sm">
          Sin movimientos registrados.
        </p>
      </div>
    )
  }

  return (
    <div>
      {showHeader ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading font-medium text-lg">
            Últimos movimientos
          </h2>
          {onViewAll ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-muted-foreground"
              onClick={onViewAll}
            >
              Ver todos →
            </Button>
          ) : null}
        </div>
      ) : null}

      <ul className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
        {visibleMovements.map((movement) => (
          <li
            key={movement.id}
            className={cn(
              compact
                ? "border-border/60 border-b py-2 last:border-0"
                : "rounded-4xl bg-card px-5 py-4 shadow-md ring-1 ring-foreground/5"
            )}
          >
            <p className={cn(compact ? "text-sm" : "font-medium")}>
              {formatKg(movement.quantityKg)} ·{" "}
              <LotLink lotId={movement.lotId} lotCode={movement.lotCode} />
            </p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {formatRoute(movement)}
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {formatRelativeTime(movement.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
