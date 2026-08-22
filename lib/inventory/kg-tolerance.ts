/** Domain tolerance for kg comparisons (2 decimal places). */
export const KG_TOLERANCE = 0.005

export function kgEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < KG_TOLERANCE
}

export function roundKg(value: number): number {
  return Math.round(value * 100) / 100
}
