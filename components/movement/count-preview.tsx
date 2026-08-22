import { Separator } from "@/components/ui/separator"
import { formatKg, formatSignedKg } from "@/lib/inventory/format-kg"
import type { CountPreview } from "@/lib/inventory/types"

export function CountPreviewView({ preview }: { preview: CountPreview }) {
  const differenceClass =
    preview.differenceKg > 0
      ? "text-green-600 dark:text-green-500"
      : preview.differenceKg < 0
        ? "text-amber-700 dark:text-amber-400"
        : "text-muted-foreground"

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <h2 className="mb-1 font-heading font-medium text-base">
          Conteo físico detectado
        </h2>
        <p className="mb-4 text-muted-foreground text-xs">
          Interpretado con IA · La diferencia se calcula contra el ledger
        </p>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Lote
            </dt>
            <dd className="font-medium text-lg">
              {preview.lotCode} · {preview.varietyName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-wide">
              Ubicación
            </dt>
            <dd className="font-medium text-lg">{preview.locationName}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <h2 className="mb-4 font-heading font-medium text-base">
          Conciliación
        </h2>

        <dl className="flex flex-col gap-3">
          <div>
            <dt className="text-muted-foreground text-sm">Stock registrado</dt>
            <dd className="font-medium text-lg tabular-nums">
              {formatKg(preview.expectedKg)}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground text-sm">Conteo físico</dt>
            <dd className="font-medium text-lg tabular-nums">
              {formatKg(preview.countedKg)}
            </dd>
          </div>

          <Separator />

          <div>
            <dt className="text-muted-foreground text-sm">Diferencia</dt>
            <dd className={`font-medium text-lg tabular-nums ${differenceClass}`}>
              {formatSignedKg(preview.differenceKg)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-muted-foreground text-sm">
          {preview.differenceKg === 0
            ? "Al confirmar, se registra el conteo. El inventario ya coincide."
            : `Al confirmar, el inventario será conciliado a ${formatKg(preview.countedKg)}.`}
        </p>
      </div>
    </div>
  )
}
