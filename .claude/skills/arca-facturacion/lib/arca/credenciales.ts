/**
 * Carga del certificado y la clave privada.
 *
 * Modelo A: un solo certificado del desarrollador, desde variables de entorno.
 * Modelo B: certificado por tenant, cifrado en base de datos.
 *
 * Los certificados nunca se leen del filesystem del proyecto. En serverless
 * el disco es efímero y de solo lectura fuera de /tmp.
 */

import type { Pool } from 'pg';

export interface Credenciales {
  cert: string; // PEM
  key: string;  // PEM
  /** Identifica el par en el cache del ticket. Un certificado, un ticket. */
  claveCache: string;
}

function decodificar(b64: string, nombre: string): string {
  const pem = Buffer.from(b64, 'base64').toString('utf8').trim();
  if (!pem.startsWith('-----BEGIN')) {
    throw new Error(
      `${nombre} no contiene un PEM válido. Verificá que el base64 se haya generado sin saltos de línea: base64 -i archivo | tr -d '\\n'`
    );
  }
  return pem;
}

/** Modelo A: credenciales únicas desde el entorno. */
export function credencialesDelEntorno(): Credenciales {
  const cert = process.env.ARCA_CERT_BASE64;
  const key = process.env.ARCA_KEY_BASE64;

  if (!cert || !key) {
    throw new Error('Faltan ARCA_CERT_BASE64 o ARCA_KEY_BASE64 en el entorno');
  }

  return {
    cert: decodificar(cert, 'ARCA_CERT_BASE64'),
    key: decodificar(key, 'ARCA_KEY_BASE64'),
    claveCache: 'default',
  };
}

/**
 * Modelo B: credenciales propias del tenant, cifradas en base.
 *
 * `descifrar` debe resolverse contra un KMS o una clave maestra fuera de la
 * base de datos. Guardar la clave de cifrado junto a los datos cifrados no
 * aporta seguridad.
 */
export async function credencialesDelTenant(
  pool: Pool,
  tenantId: string,
  descifrar: (buf: Buffer) => Promise<string>
): Promise<Credenciales> {
  const { rows } = await pool.query(
    'select cert_cifrado, key_cifrada from arca_tenants where id = $1 and activo',
    [tenantId]
  );

  if (!rows[0]?.cert_cifrado || !rows[0]?.key_cifrada) {
    throw new Error(`El tenant ${tenantId} no tiene credenciales de ARCA cargadas`);
  }

  return {
    cert: await descifrar(rows[0].cert_cifrado),
    key: await descifrar(rows[0].key_cifrada),
    claveCache: tenantId,
  };
}
