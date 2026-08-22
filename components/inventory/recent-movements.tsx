import { formatRelativeTime } from "@/lib/inventory/format-relative-time"
import type { RecentMovement } from "@/lib/inventory/movements"

function formatKg(value: number): string {
  return `${value.toLocaleString("es-AR")} kg`
}

function formatRoute(movement: RecentMovement): string {
  const origin =
    movement.type === "INITIAL_BALANCE"
      ? "Saldo inicial"
      : (movement.originName ?? "—")
  const destination = movement.destinationName ?? "—"
  return `${origin} → ${destination}`
}

export function RecentMovementsView({
  movements,
}: {
  movements: RecentMovement[]
}) {
  if (movements.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Sin movimientos registrados.</p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {movements.map((movement) => (
        <li
          key={movement.id}
          className="rounded-4xl bg-card px-5 py-4 shadow-md ring-1 ring-foreground/5"
        >
          <p className="font-medium">
            {formatKg(movement.quantityKg)} · Lote {movement.lotCode}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {formatRoute(movement)}
          </p>
          <p className="mt-1 text-muted-foreground text-xs">
            {formatRelativeTime(movement.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  )
}
