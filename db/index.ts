import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { mkdirSync } from "node:fs"
import path from "node:path"
import * as schema from "./schema"

const defaultPath = path.join(process.cwd(), "data", "papasud.db")

function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH
  if (!configured) return defaultPath
  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured)
}

let sqlite: Database.Database | null = null
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!dbInstance) {
    const dbPath = getDatabasePath()
    mkdirSync(path.dirname(dbPath), { recursive: true })
    sqlite = new Database(dbPath)
    sqlite.pragma("journal_mode = WAL")
    sqlite.pragma("foreign_keys = ON")
    dbInstance = drizzle(sqlite, { schema })
  }
  return dbInstance
}

export function closeDb() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    dbInstance = null
  }
}

export type Db = ReturnType<typeof getDb>
