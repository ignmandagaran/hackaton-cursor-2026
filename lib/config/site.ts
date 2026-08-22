/**
 * Site identity — the single source of truth for branding.
 *
 * When adopting this template, edit the values below (and the localized
 * `metadata`/`home` strings in `messages/*.json`). Everything else —
 * metadata, JSON-LD, the header/footer wordmark, and the OG image —
 * reads from here.
 */
export const siteConfig = {
  /** Full display name. Used in titles, JSON-LD, and the OG image. */
  name: "Papasud Stock Control",
  /** Short wordmark for compact UI (header/footer). */
  shortName: "Papasud Stock Control",
  /** Default description for metadata + JSON-LD. */
  description: "Control de stock de papa semilla.",
  /** Public base URL. Overridden in any environment by NEXT_PUBLIC_BASE_URL. */
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
} as const

export type SiteConfig = typeof siteConfig
