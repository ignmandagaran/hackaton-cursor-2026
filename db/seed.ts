import { count } from "drizzle-orm"
import { closeDb, getDb } from "@/db"
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
    const varietyRows = db
      .insert(varieties)
      .values([
        { name: "Spunta" },
        { name: "Innovator" },
        { name: "Asterix" },
        { name: "Kennebec" },
      ])
      .returning()
      .all()

    const varietyByName = Object.fromEntries(
      varietyRows.map((variety) => [variety.name, variety])
    )
    const spunta = varietyByName.Spunta
    const innovator = varietyByName.Innovator
    const asterix = varietyByName.Asterix
    const kennebec = varietyByName.Kennebec

    if (!spunta || !innovator || !asterix || !kennebec) {
      throw new Error("Failed to create demo varieties")
    }

    const lotRows = db
      .insert(lots)
      .values([
        { code: "224", varietyId: spunta.id },
        { code: "241", varietyId: spunta.id },
        { code: "37A", varietyId: spunta.id },
        { code: "310", varietyId: innovator.id },
        { code: "99B", varietyId: innovator.id },
        { code: "188", varietyId: asterix.id },
        { code: "452", varietyId: kennebec.id },
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
    const frio3 = locationByName["Frigorífico 3"]
    const galpon = locationByName.Galpón

    if (!frio1 || !frio2 || !frio3 || !galpon) {
      throw new Error("Failed to create demo locations")
    }

    db.insert(locationAliases)
      .values([
        { locationId: frio1.id, alias: "frío 1" },
        { locationId: frio1.id, alias: "frio 1" },
        { locationId: frio1.id, alias: "frigorifico uno" },
        { locationId: frio1.id, alias: "frigorífico 1" },
        { locationId: frio2.id, alias: "frío 2" },
        { locationId: frio2.id, alias: "frio 2" },
        { locationId: frio2.id, alias: "frigorífico 2" },
        { locationId: frio3.id, alias: "frío 3" },
        { locationId: frio3.id, alias: "frio 3" },
        { locationId: frio3.id, alias: "frigorífico 3" },
        { locationId: galpon.id, alias: "galpón" },
        { locationId: galpon.id, alias: "galpon" },
        { locationId: galpon.id, alias: "deposito" },
      ])
      .run()

    const lot224 = lotByCode["224"]
    const lot241 = lotByCode["241"]
    const lot37A = lotByCode["37A"]
    const lot310 = lotByCode["310"]
    const lot99B = lotByCode["99B"]
    const lot188 = lotByCode["188"]
    const lot452 = lotByCode["452"]

    if (
      !lot224 ||
      !lot241 ||
      !lot37A ||
      !lot310 ||
      !lot99B ||
      !lot188 ||
      !lot452
    ) {
      throw new Error("Failed to create demo lots")
    }

    const at = (day: string, time: string) => `2026-08-${day}T${time}:00-03:00`

    db.insert(movements)
      .values([
        {
          createdAt: at("18", "08:10"),
          type: "INITIAL_BALANCE",
          lotId: lot224.id,
          originLocationId: null,
          destinationLocationId: frio1.id,
          quantityKg: 2000,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 224",
        },
        {
          createdAt: at("18", "08:25"),
          type: "INITIAL_BALANCE",
          lotId: lot241.id,
          originLocationId: null,
          destinationLocationId: frio2.id,
          quantityKg: 800,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 241",
        },
        {
          createdAt: at("18", "08:40"),
          type: "INITIAL_BALANCE",
          lotId: lot37A.id,
          originLocationId: null,
          destinationLocationId: galpon.id,
          quantityKg: 450,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 37A",
        },
        {
          createdAt: at("18", "09:05"),
          type: "INITIAL_BALANCE",
          lotId: lot310.id,
          originLocationId: null,
          destinationLocationId: frio3.id,
          quantityKg: 1500,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 310",
        },
        {
          createdAt: at("18", "09:20"),
          type: "INITIAL_BALANCE",
          lotId: lot452.id,
          originLocationId: null,
          destinationLocationId: galpon.id,
          quantityKg: 2200,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 452",
        },
        {
          createdAt: at("19", "07:40"),
          type: "INITIAL_BALANCE",
          lotId: lot188.id,
          originLocationId: null,
          destinationLocationId: frio1.id,
          quantityKg: 950,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 188",
        },
        {
          createdAt: at("19", "10:15"),
          type: "TRANSFER",
          lotId: lot224.id,
          originLocationId: frio1.id,
          destinationLocationId: galpon.id,
          quantityKg: 400,
          rawInput: "pasar 400 kg del lote 224 de frío 1 al galpón",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("19", "11:05"),
          type: "TRANSFER",
          lotId: lot224.id,
          originLocationId: frio1.id,
          destinationLocationId: frio2.id,
          quantityKg: 250,
          rawInput: "mover 250 kilos del 224 al frigorífico 2",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("19", "14:20"),
          type: "TRANSFER",
          lotId: lot310.id,
          originLocationId: frio3.id,
          destinationLocationId: frio1.id,
          quantityKg: 500,
          rawInput: "transferir 500 kg lote 310 de frío 3 a frío 1",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("19", "16:40"),
          type: "TRANSFER",
          lotId: lot452.id,
          originLocationId: galpon.id,
          destinationLocationId: frio2.id,
          quantityKg: 800,
          rawInput: null,
          source: "MANUAL",
          notes: "Preparación de pedido",
        },
        {
          createdAt: at("20", "08:50"),
          type: "TRANSFER",
          lotId: lot224.id,
          originLocationId: galpon.id,
          destinationLocationId: frio3.id,
          quantityKg: 150,
          rawInput: "llevar 150 kg del 224 del galpón a frío 3",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("20", "09:30"),
          type: "TRANSFER",
          lotId: lot241.id,
          originLocationId: frio2.id,
          destinationLocationId: frio3.id,
          quantityKg: 200,
          rawInput: "pasar 200 kg lote 241 a frigorífico 3",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("20", "11:10"),
          type: "TRANSFER",
          lotId: lot452.id,
          originLocationId: galpon.id,
          destinationLocationId: frio3.id,
          quantityKg: 400,
          rawInput: null,
          source: "MANUAL",
          notes: "Reacomodo de cámara",
        },
        {
          createdAt: at("20", "15:00"),
          type: "TRANSFER",
          lotId: lot37A.id,
          originLocationId: galpon.id,
          destinationLocationId: frio1.id,
          quantityKg: 80,
          rawInput: "sacar 80 kg del lote 37A del galpón a frío 1",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("21", "08:15"),
          type: "ADJUSTMENT",
          lotId: lot224.id,
          originLocationId: null,
          destinationLocationId: frio1.id,
          quantityKg: 80,
          rawInput: null,
          source: "MANUAL",
          notes: "Reproceso de bolsas recuperadas",
        },
        {
          createdAt: at("21", "10:45"),
          type: "TRANSFER",
          lotId: lot310.id,
          originLocationId: frio1.id,
          destinationLocationId: galpon.id,
          quantityKg: 200,
          rawInput: "pasar 200 kg del 310 de frío 1 al galpón",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("21", "13:20"),
          type: "TRANSFER",
          lotId: lot188.id,
          originLocationId: frio1.id,
          destinationLocationId: frio2.id,
          quantityKg: 300,
          rawInput: "mover 300 kg lote 188 a frío 2",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("21", "17:05"),
          type: "TRANSFER",
          lotId: lot224.id,
          originLocationId: frio1.id,
          destinationLocationId: galpon.id,
          quantityKg: 120,
          rawInput: "pasar 120 kg del 224 al galpón — carga duplicada",
          source: "NATURAL_LANGUAGE",
          deletedAt: at("21", "17:12"),
          notes: "Anulado: carga duplicada",
        },
        {
          createdAt: at("22", "07:50"),
          type: "INITIAL_BALANCE",
          lotId: lot99B.id,
          originLocationId: null,
          destinationLocationId: frio2.id,
          quantityKg: 600,
          rawInput: null,
          source: "IMPORT",
          notes: "Ingreso cosecha lote 99B",
        },
        {
          createdAt: at("22", "09:10"),
          type: "TRANSFER",
          lotId: lot224.id,
          originLocationId: frio1.id,
          destinationLocationId: galpon.id,
          quantityKg: 100,
          rawInput: "pasar 100 kg del lote 224 de frío 1 al galpón",
          source: "NATURAL_LANGUAGE",
        },
        {
          createdAt: at("22", "10:30"),
          type: "ADJUSTMENT",
          lotId: lot452.id,
          originLocationId: galpon.id,
          destinationLocationId: null,
          quantityKg: 50,
          rawInput: null,
          source: "MANUAL",
          notes: "Merma por tubérculos descartados",
        },
      ])
      .run()

    db.insert(stockCounts)
      .values([
        {
          lotId: lot241.id,
          locationId: frio2.id,
          quantityKg: 600,
          countedAt: at("22", "11:00"),
          notes: "Conteo exacto",
          createdAt: at("22", "11:00"),
        },
        {
          lotId: lot188.id,
          locationId: frio1.id,
          quantityKg: 650,
          countedAt: at("22", "11:20"),
          notes: "Conteo exacto",
          createdAt: at("22", "11:20"),
        },
        {
          lotId: lot241.id,
          locationId: frio3.id,
          quantityKg: 180,
          countedAt: at("22", "11:40"),
          notes: "Faltan 20 kg respecto al sistema",
          createdAt: at("22", "11:40"),
        },
        {
          lotId: lot310.id,
          locationId: frio3.id,
          quantityKg: 1040,
          countedAt: at("22", "12:05"),
          notes: "Sobra contra el sistema",
          createdAt: at("22", "12:05"),
        },
        {
          lotId: lot452.id,
          locationId: galpon.id,
          quantityKg: 910,
          countedAt: at("22", "12:25"),
          notes: "Diferencia post merma",
          createdAt: at("22", "12:25"),
        },
      ])
      .run()
  })

  console.log("Seed complete.")
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
  closeDb()
}
