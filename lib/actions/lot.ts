"use server"

import { getLotDetails, type LotDetails } from "@/lib/inventory/lot-details"

export async function fetchLotDetails(
  lotId: number
): Promise<LotDetails | null> {
  return getLotDetails(lotId)
}
