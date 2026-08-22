import type { MovementType } from "@/db/schema"

export function formatRoute({
  type,
  originName,
  destinationName,
}: {
  type: MovementType
  originName: string | null
  destinationName: string | null
}): string {
  if (type === "ADJUSTMENT") {
    const location = destinationName ?? originName ?? "—"
    return `Ajuste por conteo · ${location}`
  }

  const origin =
    type === "INITIAL_BALANCE" ? "Saldo inicial" : (originName ?? "—")
  const destination = destinationName ?? "—"
  return `${origin} → ${destination}`
}

export function adjustmentSign(originName: string | null, destinationName: string | null) {
  if (destinationName && !originName) return 1
  if (originName && !destinationName) return -1
  return 0
}

