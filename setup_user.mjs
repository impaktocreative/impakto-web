/**
 * Crea el usuario administrador del panel.
 *
 * Antes tenía la service role key y la contraseña del admin escritas en el
 * archivo, que está versionado. Ahora salen del entorno.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node setup_user.js
 *
 * Usa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

// Carga mínima de .env.local para no depender de dotenv.
if (existsSync('.env.local')) {
  for (const linea of readFileSync('.env.local', 'utf8').split('\n')) {
    const i = linea.indexOf('=')
    if (i === -1 || linea.trim().startsWith('#')) continue
    const clave = linea.slice(0, i).trim()
    if (!process.env[clave]) process.env[clave] = linea.slice(i + 1).trim()
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

if (!email || !password) {
  console.error('Faltan ADMIN_EMAIL y ADMIN_PASSWORD. Ejemplo:')
  console.error('  ADMIN_EMAIL=hola@ejemplo.com ADMIN_PASSWORD=... node setup_user.js')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const { error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error) {
  if (error.message.includes('already registered')) {
    console.log('El usuario ya existe.')
  } else {
    console.error('Error creando el usuario:', error.message)
    process.exitCode = 1
  }
} else {
  console.log(`Usuario creado: ${email}`)
}
