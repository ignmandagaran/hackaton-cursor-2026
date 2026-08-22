import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatKg } from "@/lib/inventory/format-kg"
import type { PendingTransfer } from "@/lib/inventory/types"

export function InsufficientStockView({
  pending,
  availableKg,
  onCount,
  onEdit,
}: {
  pending: PendingTransfer
  availableKg: number
  onCount: () => void
  onEdit: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Stock insuficiente según el sistema</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-1">
          <p>
            Querés mover{" "}
            <span className="font-medium tabular-nums">
              {formatKg(pending.quantityKg)}
            </span>
          </p>
          <p>
            Stock registrado{" "}
            <span className="font-medium tabular-nums">
              {formatKg(availableKg)}
            </span>
          </p>
          <p className="text-muted-foreground">
            Lote {pending.lotCode} · {pending.originName} → {pending.destinationName}
          </p>
          <p className="pt-2">
            Si el stock físico es distinto, realizá un conteo antes de continuar.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onCount}>
            Corregir con un conteo
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Editar movimiento
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
