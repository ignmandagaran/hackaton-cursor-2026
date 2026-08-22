import { count } from "drizzle-orm"
import { getDb } from "@/db"
import {
  locationAliases,
  locations,
  lots,
  movements,
  stockCounts,
  varieties,
} from "@/db/schema"

/**
 * Demo seed data for Papasud MVP.
 *
 * IMPORTANT: The official names of the 3 cold-storage facilities + 1 warehouse
 * are NOT conclusively mapped from the supplied spreadsheet. These location
 * labels are explicit demo placeholders until real mapping is confirmed.
 */
export function seedDatabase() {
  const db = getDb()

  const existingLots = db.select({ total: count() }).from(lots).get()
  if (existingLots && existingLots.total > 0) {
    console.log("Database already seeded, skipping.")
    return
  }

  console.log("Seeding demo data...")

  db.transaction(() => {
    const [variety] = db
      .insert(varieties)
      .values({ name: "Spunta" })
      .returning()
      .all()

    if (!variety) throw new Error("Failed to create variety")

    const lotRows = db
      .insert(lots)
      .values([
        { code: "224", varietyId: variety.id },
        { code: "241", varietyId: variety.id },
        { code: "37A", varietyId: variety.id },
      ])
      .returning()
      .all()

    const lotByCode = Object.fromEntries(lotRows.map((lot) => [lot.code, lot]))

    const locationRows = db
      .insert(locations)
      .values([
        { name: "Frigorífico 1", type: "COLD_STORAGE" },
        { name: "Frigorífico 2", type: "COLD_STORAGE" },
        { name: "Frigorífico 3", type: "COLD_STORAGE" },
        { name: "Galpón", type: "WAREHOUSE" },
      ])
      .returning()
      .all()

    const locationByName = Object.fromEntries(
      locationRows.map((location) => [location.name, location])
    )

    const frio1 = locationByName["Frigorífico 1"]
    const frio2 = locationByName["Frigorífico 2"]
    const galpon = locationByName["Galpón"]

    if (!frio1 || !frio2 || !galpon) {
      throw new Error("Failed to create demo locations")
    }

    db.insert(locationAliases)
      .values([
        { locationId: frio1.id, alias: "frío 1" },
        { locationId: frio1.id, alias: "frio 1" },
        { locationId: frio1.id, alias: "frigorifico uno" },
        { locationId: frio1.id, alias: "frigorífico 1" },
        { locationId: frio2.id, alias: "frío 2" },
        { locationId: frio2.id, alias: "frigorífico 2" },
        { locationId: galpon.id, alias: "galpón" },
        { locationId: galpon.id, alias: "galpon" },
      ])
      .run()

    const lot224 = lotByCode["224"]
    const lot241 = lotByCode["241"]
    const lot37A = lotByCode["37A"]

    if (!lot224 || !lot241 || !lot37A) {
      throw new Error("Failed to create demo lots")
    }

    const now = new Date().toISOString()

    db.insert(movements)
      .values([
        {
          createdAt: now,
          type: "INITIAL_BALANCE",
          lotId: lot224.id,
          originLocationId: null,
          destinationLocationId: frio1.id,
          quantityKg: 1240,
          rawInput: null,
          source: "MANUAL",
          notes: "Saldo inicial demo",
        },
        {
          createdAt: now,
          type: "INITIAL_BALANCE",
          lotId: lot241.id,
          originLocationId: null,
          destinationLocationId: frio2.id,
          quantityKg: 800,
          rawInput: null,
          source: "MANUAL",
          notes: "Saldo inicial demo",
        },
        {
          createdAt: now,
          type: "INITIAL_BALANCE",
          lotId: lot37A.id,
          originLocationId: null,
          destinationLocationId: galpon.id,
          quantityKg: 300,
          rawInput: null,
          source: "MANUAL",
          notes: "Saldo inicial demo",
        },
      ])
      .run()

    const countTime = new Date().toISOString()

    // Scenario A: exact match (Lote 241 · Frigorífico 2)
    db.insert(stockCounts)
      .values([
        {
          lotId: lot241.id,
          locationId: frio2.id,
          quantityKg: 800,
          countedAt: countTime,
          notes: "Conteo exacto demo",
          createdAt: countTime,
        },
      ])
      .run()
  })

  console.log("Seed complete.")
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
}
