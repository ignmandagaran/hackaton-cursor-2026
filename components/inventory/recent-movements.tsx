import { MovementDeleteButton } from "@/components/inventory/movement-delete-button"
import { LotLink } from "@/components/inventory/lot-link"
import { RelativeTime } from "@/components/inventory/relative-time"
import { formatKg } from "@/lib/inventory/format-kg"
import { formatRoute } from "@/lib/inventory/format-route"
import type { RecentMovement } from "@/lib/inventory/movements"
import { cn } from "@/lib/styles/cn"

export function MovementsList({
  movements,
  emptyMessage,
  deletedLabel,
  locale = "es",
}: {
  movements: RecentMovement[]
  emptyMessage: string
  deletedLabel: string
  locale?: string
}) {
  if (movements.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {movements.map((movement) => {
        const isDeleted = movement.deletedAt !== null

        return (
          <li
            key={movement.id}
            className={cn(
              "rounded-4xl bg-card px-5 py-4 shadow-md ring-1 ring-foreground/5",
              isDeleted && "opacity-70"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isDeleted && "text-muted-foreground line-through"
                  )}
                >
                  {formatKg(movement.quantityKg)} ·{" "}
                  <LotLink lotId={movement.lotId} lotCode={movement.lotCode} />
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  {formatRoute(movement)}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  <RelativeTime isoDate={movement.createdAt} locale={locale} />
                </p>
                {isDeleted && movement.deletedAt && (
                  <p className="mt-1 text-destructive text-xs">
                    {deletedLabel} ·{" "}
                    <RelativeTime isoDate={movement.deletedAt} locale={locale} />
                  </p>
                )}
              </div>
              <MovementDeleteButton movement={movement} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function RecentMovementsView({
  movements,
  emptyMessage,
  deletedLabel,
  locale,
}: {
  movements: RecentMovement[]
  emptyMessage: string
  deletedLabel: string
  locale?: string | undefined
}) {
  return (
    <MovementsList
      movements={movements}
      emptyMessage={emptyMessage}
      deletedLabel={deletedLabel}
      {...(locale ? { locale } : {})}
    />
  )
}
