import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MovementErrorView({
  error,
}: {
  error: {
    message: string
    details?: Record<string, string | number> | undefined
  }
}) {
  const details = error.details
  const isInsufficientStock =
    details &&
    "requested" in details &&
    "available" in details &&
    "lotCode" in details &&
    "origin" in details

  return (
    <Alert variant="destructive">
      <AlertTitle>{error.message}</AlertTitle>
      <AlertDescription>
        {isInsufficientStock ? (
          <div className="mt-1 space-y-1">
            <p>
              Solicitado:{" "}
              {Number(details.requested).toLocaleString("es-AR")} kg
            </p>
            <p>
              Disponible:{" "}
              {Number(details.available).toLocaleString("es-AR")} kg
            </p>
            <p>
              Lote {String(details.lotCode)} · {String(details.origin)}
            </p>
          </div>
        ) : details?.matches ? (
          <p className="mt-1">Coincidencias: {String(details.matches)}</p>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
