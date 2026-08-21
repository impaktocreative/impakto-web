/**
 * Aplica un archivo .sql contra la base por conexión directa.
 *
 * Antes tenía la contraseña de Postgres escrita en el archivo, y el archivo
 * está versionado. Ahora sale del entorno.
 *
 *   DATABASE_URL='postgresql://...' node setup_db.js supabase_schema.sql
 *
 * La cadena de conexión se saca de Supabase en Project Settings > Database >
 * Connection string. No la pegues acá.
 */
import { readFileSync } from 'node:fs'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('Falta DATABASE_URL. Ejemplo:')
  console.error("  DATABASE_URL='postgresql://...' node setup_db.js supabase_schema.sql")
  process.exit(1)
}

const archivo = process.argv[2] ?? 'supabase_schema.sql'

const client = new pg.Client({ connectionString })

try {
  await client.connect()
  const sql = readFileSync(archivo, 'utf8')
  await client.query(sql)
  console.log(`Aplicado: ${archivo}`)
} catch (err) {
  console.error(`Error aplicando ${archivo}:`, err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.end()
}
