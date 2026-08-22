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
  const origin =
    type === "INITIAL_BALANCE" ? "Saldo inicial" : (originName ?? "—")
  const destination = destinationName ?? "—"
  return `${origin} → ${destination}`
}
