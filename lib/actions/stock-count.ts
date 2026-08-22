"use server"

import { asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { locations, lots, varieties } from "@/db/schema"
import { routing } from "@/i18n/routing"
import { createStockCount } from "@/lib/inventory/stock-counts"

export type StockCountOption = {
  id: number
  label: string
}

export type RegisterStockCountPayload = {
  lotId: number
  locationId: number
  quantityKg: number
  notes?: string | undefined
}

export type RegisterStockCountResult =
  | { ok: true }
  | { ok: false; error: string }

function revalidateHome() {
  for (const locale of routing.locales) {
    const path = locale === routing.defaultLocale ? "/" : `/${locale}`
    revalidatePath(path)
  }
}

export async function getStockCountOptions(): Promise<{
  lots: StockCountOption[]
  locations: StockCountOption[]
}> {
  const db = getDb()

  const lotRows = db
    .select({
      id: lots.id,
      code: lots.code,
      varietyName: varieties.name,
    })
    .from(lots)
    .innerJoin(varieties, eq(lots.varietyId, varieties.id))
    .orderBy(asc(lots.code))
    .all()

  const locationRows = db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .orderBy(asc(locations.name))
    .all()

  return {
    lots: lotRows.map((lot) => ({
      id: lot.id,
      label: `Lote ${lot.code} · ${lot.varietyName}`,
    })),
    locations: locationRows.map((location) => ({
      id: location.id,
      label: location.name,
    })),
  }
}

export async function registerStockCount(
  payload: RegisterStockCountPayload
): Promise<RegisterStockCountResult> {
  if (!payload.lotId || !payload.locationId) {
    return { ok: false, error: "Seleccioná lote y ubicación." }
  }

  if (!Number.isFinite(payload.quantityKg) || payload.quantityKg < 0) {
    return { ok: false, error: "Ingresá una cantidad válida en kg." }
  }

  createStockCount({
    lotId: payload.lotId,
    locationId: payload.locationId,
    quantityKg: payload.quantityKg,
    notes: payload.notes,
  })

  revalidateHome()
  return { ok: true }
}
