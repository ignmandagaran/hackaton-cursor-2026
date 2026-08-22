import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatKg } from "@/lib/inventory/format-kg"
import type { MovementError } from "@/lib/inventory/types"

export function MovementErrorView({
  error,
  onEdit,
}: {
  error: Pick<MovementError, "message" | "details"> & {
    code?: MovementError["code"]
  }
  onEdit?: () => void
}) {
  const details = error.details
  const isInsufficientStock = error.code === "INSUFFICIENT_STOCK" && details
  const isLocationNotFound =
    error.code === "ORIGIN_NOT_FOUND" ||
    error.code === "DESTINATION_NOT_FOUND" ||
    error.code === "LOCATION_NOT_FOUND" ||
    error.code === "LOCATION_REQUIRED"
  const isAmbiguous =
    (error.code === "AMBIGUOUS_ORIGIN" ||
      error.code === "AMBIGUOUS_DESTINATION" ||
      error.code === "AMBIGUOUS_LOCATION") &&
    details?.matches
  const isMissingInfo =
    error.code === "PARSE_ERROR" && typeof details?.missing === "string"
  const isLotNotFound = error.code === "LOT_NOT_FOUND"

  const title = isInsufficientStock
    ? "Stock insuficiente"
    : error.message.split("\n")[0]

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {isInsufficientStock && details ? (
          <div className="mt-2 space-y-1">
            <p>
              Querés mover{" "}
              <span className="font-medium tabular-nums">
                {formatKg(Number(details.requested))}
              </span>
            </p>
            <p>
              Disponible{" "}
              <span className="font-medium tabular-nums">
                {formatKg(Number(details.available))}
              </span>
            </p>
            <p className="text-muted-foreground">
              Lote {String(details.lotCode)} · {String(details.origin)}
            </p>
          </div>
        ) : isMissingInfo ? (
          <div className="mt-2 space-y-2">
            <p>Necesitamos más datos para interpretar la operación.</p>
          </div>
        ) : isLotNotFound ? (
          <p className="mt-1">
            Revisá el número de lote e intentá nuevamente.
          </p>
        ) : isLocationNotFound ? (
          <p className="mt-1">Revisá el nombre de la ubicación.</p>
        ) : isAmbiguous ? (
          <p className="mt-1">
            Coincidencias posibles: {String(details.matches)}
          </p>
        ) : error.message.includes("\n") ? (
          <p className="mt-1 whitespace-pre-line">
            {error.message.split("\n").slice(1).join("\n").trim()}
          </p>
        ) : null}

        {onEdit ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onEdit}
          >
            Editar
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
