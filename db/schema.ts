import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const locationTypes = ["COLD_STORAGE", "WAREHOUSE", "OTHER"] as const
export type LocationType = (typeof locationTypes)[number]

export const movementTypes = ["INITIAL_BALANCE", "TRANSFER", "ADJUSTMENT"] as const
export type MovementType = (typeof movementTypes)[number]

export const movementSources = ["NATURAL_LANGUAGE", "MANUAL", "IMPORT"] as const
export type MovementSource = (typeof movementSources)[number]

export const varieties = sqliteTable("varieties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
})

export const lots = sqliteTable("lots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  varietyId: integer("variety_id")
    .notNull()
    .references(() => varieties.id),
})

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  type: text("type").$type<LocationType>().notNull(),
})

export const locationAliases = sqliteTable("location_aliases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  alias: text("alias").notNull().unique(),
})

export const stockCounts = sqliteTable("stock_counts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lotId: integer("lot_id")
    .notNull()
    .references(() => lots.id),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id),
  quantityKg: real("quantity_kg").notNull(),
  countedAt: text("counted_at").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
})

export const movements = sqliteTable("movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  type: text("type").$type<MovementType>().notNull(),
  lotId: integer("lot_id")
    .notNull()
    .references(() => lots.id),
  originLocationId: integer("origin_location_id").references(() => locations.id),
  destinationLocationId: integer("destination_location_id").references(
    () => locations.id
  ),
  quantityKg: real("quantity_kg").notNull(),
  rawInput: text("raw_input"),
  source: text("source").$type<MovementSource>().notNull(),
  notes: text("notes"),
  deletedAt: text("deleted_at"),
  stockCountId: integer("stock_count_id").references(() => stockCounts.id),
})
