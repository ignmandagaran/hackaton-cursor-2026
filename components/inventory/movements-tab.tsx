import { RecentMovementsView } from "@/components/inventory/recent-movements"
import { MovementForm } from "@/components/movement/movement-form"
import type { RecentMovement } from "@/lib/inventory/movements"

export function MovementsTab({ movements }: { movements: RecentMovement[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section>
        <h2 className="mb-1 font-heading font-medium text-lg">
          Registrar movimiento
        </h2>
        <p className="mb-4 text-muted-foreground text-sm">
          Describí transferencias de stock en lenguaje natural
        </p>
        <MovementForm />
      </section>

      <section>
        <h2 className="mb-4 font-heading font-medium text-lg">
          Últimos movimientos
        </h2>
        <RecentMovementsView movements={movements} />
      </section>
    </div>
  )
}
