/**
 * Cache del Ticket de Acceso en Postgres.
 *
 * ARCA emite un solo ticket por combinación de certificado y servicio cada
 * 12 horas. Con varias instancias serverless corriendo en paralelo, si cada
 * una pide el suyo, todas menos la primera reciben coe.alreadyAuthenticated
 * y quedan sin poder facturar hasta que expire.
 *
 * El advisory lock hace que solo una instancia hable con WSAA. Las demás
 * esperan y leen el valor que esa dejó cacheado.
 */

import type { Pool, PoolClient } from 'pg';
import { solicitarTA, ErrorTicketVigente, type TicketAcceso } from './wsaa';
import type { Credenciales } from './credenciales';

/** Se renueva si falta menos de esto para el vencimiento. */
const MARGEN_MS = 15 * 60 * 1000;

function vigente(expira: Date): boolean {
  return expira.getTime() - Date.now() > MARGEN_MS;
}

async function leer(
  q: Pool | PoolClient,
  clave: string
): Promise<TicketAcceso | null> {
  const { rows } = await q.query(
    'select token, sign, expira from arca_ta_cache where clave = $1',
    [clave]
  );
  if (!rows[0]) return null;
  if (!vigente(new Date(rows[0].expira))) return null;

  return {
    token: rows[0].token,
    sign: rows[0].sign,
    expira: new Date(rows[0].expira).toISOString(),
  };
}

/**
 * Devuelve un ticket vigente, renovándolo si hace falta.
 *
 * @param cred Credenciales del certificado. La claveCache identifica el par,
 *             porque cada certificado tiene su propio ticket.
 */
export async function getTA(
  pool: Pool,
  cred: Credenciales,
  servicio = 'wsfe'
): Promise<TicketAcceso> {
  const clave = `${cred.claveCache}:${servicio}`;

  // Camino rápido, sin lock: la mayoría de las llamadas terminan acá.
  const cacheado = await leer(pool, clave);
  if (cacheado) return cacheado;

  const client = await pool.connect();
  try {
    await client.query('begin');

    // El lock se libera solo al terminar la transacción.
    await client.query('select pg_advisory_xact_lock(hashtext($1))', [
      `arca_ta_${clave}`,
    ]);

    // Otra instancia pudo haberlo renovado mientras esperábamos el lock.
    const reintento = await leer(client, clave);
    if (reintento) {
      await client.query('commit');
      return reintento;
    }

    let ta: TicketAcceso;
    try {
      ta = await solicitarTA(cred, servicio);
    } catch (e) {
      if (e instanceof ErrorTicketVigente) {
        // ARCA tiene un ticket vivo que nosotros no guardamos. Suele pasar
        // en desarrollo, o tras perder la base. No hay forma de recuperarlo:
        // hay que esperar a que expire o usar otro certificado.
        await client.query('rollback');
        throw new Error(
          'ARCA tiene un ticket vigente para este certificado que no está en el cache. ' +
            'Esperá a que expire (hasta 12 h) o usá un segundo certificado con otro alias. ' +
            `Detalle: ${e.message}`
        );
      }
      await client.query('rollback');
      throw e;
    }

    await client.query(
      `insert into arca_ta_cache (clave, token, sign, expira, actualizado)
       values ($1, $2, $3, $4, now())
       on conflict (clave) do update
         set token = excluded.token,
             sign = excluded.sign,
             expira = excluded.expira,
             actualizado = now()`,
      [clave, ta.token, ta.sign, ta.expira]
    );

    await client.query('commit');
    return ta;
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
