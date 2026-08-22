import { Button } from "@/components/ui/button"
import { formatKg } from "@/lib/inventory/format-kg"
import type { CountLocationChoice } from "@/lib/inventory/types"

export function CountLocationChoiceView({
  choice,
  onSelect,
  onEdit,
}: {
  choice: CountLocationChoice
  onSelect: (locationId: number) => void
  onEdit: () => void
}) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5">
        <h2 className="font-heading font-medium text-base">
          ¿Dónde realizaste el conteo?
        </h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Lote {choice.lotCode} · {choice.varietyName}
        </p>
        <p className="mt-1 text-muted-foreground text-sm">
          El lote está en más de una ubicación. Elegí dónde contaste{" "}
          {formatKg(choice.countedKg)}.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {choice.locations.map((location) => (
            <Button
              key={location.locationId}
              variant="outline"
              className="h-auto justify-between py-3"
              onClick={() => onSelect(location.locationId)}
            >
              <span>{location.locationName}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatKg(location.quantityKg)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={onEdit}>
        Editar
      </Button>
    </div>
  )
}
