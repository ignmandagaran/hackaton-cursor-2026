import { Separator } from "@/components/ui/separator"
import type { MovementPreview } from "@/lib/inventory/types"

function formatKg(value: number): string {
  return `${value.toLocaleString("es-AR")} kg`
}

export function MovementPreviewView({
  preview,
}: {
  preview: MovementPreview
}) {
  return (
    <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
      <h2 className="mb-4 font-heading font-medium text-base">
        Movimiento detectado
      </h2>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs uppercase">Lote</dt>
          <dd className="font-medium text-lg">{preview.lotCode}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase">Cantidad</dt>
          <dd className="font-medium text-lg">
            {formatKg(preview.quantityKg)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase">Origen</dt>
          <dd className="font-medium text-lg">{preview.originName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs uppercase">Destino</dt>
          <dd className="font-medium text-lg">{preview.destinationName}</dd>
        </div>
      </dl>

      <Separator className="my-6" />

      <dl className="grid gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground text-sm">Stock disponible</dt>
          <dd className="font-medium">{formatKg(preview.availableStock)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground text-sm">
            Stock luego del movimiento
          </dt>
          <dd className="font-medium">{formatKg(preview.stockAfter)}</dd>
        </div>
      </dl>
    </div>
  )
}
