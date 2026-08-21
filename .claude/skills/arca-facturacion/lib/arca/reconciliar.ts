/**
 * Reconciliación de comprobantes pendientes.
 *
 * Un comprobante queda en estado pendiente cuando ARCA otorgó el CAE pero la
 * respuesta se perdió, o cuando el proceso murió entre la llamada y el update.
 * En ambos casos ARCA tiene el comprobante registrado y nosotros no.
 *
 * Correr como job periódico, cada 5 o 10 minutos.
 */

import type { Pool } from 'pg';
import { llamarWSFE } from './wsfe';
import { getTA } from './ta-cache';
import type { Credenciales } from './credenciales';

export interface ResultadoReconciliacion {
  revisados: number;
  recuperados: number;
  sinRegistroEnArca: number;
}

/** Consulta un comprobante puntual en ARCA. */
export async function consultarComprobante(
  pool: Pool,
  cred: Credenciales,
  cuit: number,
  ptoVta: number,
  cbteTipo: number,
  numero: number
): Promise<{ cae: string; caeVto: string } | null> {
  const ta = await getTA(pool, cred, 'wsfe');

  try {
    const r = await llamarWSFE<any>(
      'FECompConsultar',
      `<ar:FeCompConsReq>
         <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
         <ar:CbteNro>${numero}</ar:CbteNro>
         <ar:PtoVta>${ptoVta}</ar:PtoVta>
       </ar:FeCompConsReq>`,
      ta,
      cuit
    );

    const det = r?.ResultGet;
    if (!det?.CodAutorizacion) return null;

    return {
      cae: String(det.CodAutorizacion),
      caeVto: String(det.FchVto),
    };
  } catch {
    // ARCA devuelve error cuando el comprobante no existe. No es un fallo.
    return null;
  }
}

/**
 * Recorre los comprobantes pendientes con más de `minutosMinimos` de
 * antigüedad y los resuelve consultando a ARCA.
 */
export async function reconciliar(
  pool: Pool,
  cred: Credenciales,
  minutosMinimos = 5
): Promise<ResultadoReconciliacion> {
  const { rows } = await pool.query(
    `select c.id, c.pto_vta, c.cbte_tipo, c.numero, t.cuit
       from arca_comprobantes c
       join arca_tenants t on t.id = c.tenant_id
      where c.estado = 'pendiente'
        and c.created_at < now() - ($1 || ' minutes')::interval
      order by c.created_at
      limit 100`,
    [minutosMinimos]
  );

  let recuperados = 0;
  let sinRegistro = 0;

  for (const r of rows) {
    const encontrado = await consultarComprobante(
      pool,
      cred,
      Number(r.cuit),
      Number(r.pto_vta),
      Number(r.cbte_tipo),
      Number(r.numero)
    );

    if (encontrado) {
      await pool.query(
        `update arca_comprobantes
            set estado = 'autorizado', cae = $1,
                cae_vto = to_date($2, 'YYYYMMDD'), updated_at = now()
          where id = $3`,
        [encontrado.cae, encontrado.caeVto, r.id]
      );
      recuperados++;
    } else {
      // ARCA no lo tiene. El número quedó libre pero ya está reservado en
      // nuestra base, así que se marca anulado para preservar la correlatividad.
      await pool.query(
        `update arca_comprobantes
            set estado = 'anulado', updated_at = now()
          where id = $1`,
        [r.id]
      );
      sinRegistro++;
    }
  }

  return {
    revisados: rows.length,
    recuperados,
    sinRegistroEnArca: sinRegistro,
  };
}
