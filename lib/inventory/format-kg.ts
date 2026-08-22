export function formatKg(value: number): string {
  return `${value.toLocaleString("es-AR")} kg`
}

export function formatSignedKg(value: number): string {
  if (value > 0) return `+${formatKg(value)}`
  if (value < 0) return `-${formatKg(Math.abs(value))}`
  return formatKg(0)
}

