import { CheckCircle } from "@phosphor-icons/react"
import { Separator } from "@/components/ui/separator"
import { formatKg } from "@/lib/inventory/format-kg"
import type { MovementPreview } from "@/lib/inventory/types"

export function MovementPreviewView({
  preview,
}: {
  preview: MovementPreview
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <h2 className="mb-1 font-heading font-medium text-base">
          Movimiento interpretado
        </h2>
        <p className="mb-4 text-muted-foreground text-xs">
          Interpretado con IA · Stock validado contra inventario
        </p>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Lote
            </dt>
            <dd className="font-medium text-lg">{preview.lotCode}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Cantidad
            </dt>
            <dd className="font-medium text-lg">
              {formatKg(preview.quantityKg)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Origen
            </dt>
            <dd className="font-medium text-lg">{preview.originName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Destino
            </dt>
            <dd className="font-medium text-lg">{preview.destinationName}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading font-medium text-base">
            Validación de stock
          </h2>
          <span className="inline-flex items-center gap-1.5 text-green-600 text-sm dark:text-green-500">
            <CheckCircle className="size-4" weight="fill" />
            Stock disponible
          </span>
        </div>

        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-muted-foreground text-sm">
              Disponible en {preview.originName}
            </dt>
            <dd className="font-medium text-lg tabular-nums">
              {formatKg(preview.availableStock)}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm">Movimiento</dt>
            <dd className="font-medium text-lg tabular-nums">
              −{formatKg(preview.quantityKg)}
            </dd>
          </div>

          <Separator />

          <div>
            <dt className="text-muted-foreground text-sm">
              Stock resultante en {preview.originName}
            </dt>
            <dd className="font-medium text-lg tabular-nums">
              {formatKg(preview.stockAfter)}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm">
              {preview.destinationName} después del movimiento
            </dt>
            <dd className="font-medium text-lg tabular-nums">
              {formatKg(preview.destinationStockAfter)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
