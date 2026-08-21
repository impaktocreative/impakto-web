/**
 * Orquestación de la emisión.
 *
 * La transacción se mantiene abierta durante la llamada a ARCA. Parece un
 * antipatrón, pero la numeración de un punto de venta tiene que ser
 * correlativa y sin huecos, así que las emisiones se serializan igual.
 * Sostener el lock garantiza que un fallo haga rollback y libere el número,
 * en lugar de dejar un hueco que después hay que tapar con un comprobante
 * anulado.
 */

import type { Pool, PoolClient } from 'pg';
import { llamarWSFE, ErrorWSFE } from './wsfe';
import { getTA } from './ta-cache';
import { armarFECAESolicitar } from './comprobantes';
import { fechaARCA, type DatosComprobante, type ResultadoEmision } from './tipos';
import type { Credenciales } from './credenciales';
import { esProduccion } from './config';

export interface ContextoTenant {
  id: string;
  cuit: number;
  ptoVta: number;
}

export interface OpcionesEmision {
  pool: Pool;
  cred: Credenciales;
  tenant: ContextoTenant;
  cbteTipo: number;
  datos: DatosComprobante;
  /** Identificador externo, típicamente el id de la orden. Da idempotencia. */
  referencia?: string;
  /** Fecha del comprobante en formato yyyymmdd. Por defecto, hoy. */
  fecha?: string;
}

/** Reserva el siguiente número. El update toma el lock de fila. */
async function reservarNumero(
  client: PoolClient,
  tenantId: string,
  ptoVta: number,
  cbteTipo: number
): Promise<number> {
  await client.query(
    `insert into arca_contadores (tenant_id, pto_vta, cbte_tipo, ultimo_numero)
     values ($1, $2, $3, 0)
     on conflict (tenant_id, pto_vta, cbte_tipo) do nothing`,
    [tenantId, ptoVta, cbteTipo]
  );

  const { rows } = await client.query(
    `update arca_contadores
        set ultimo_numero = ultimo_numero + 1
      where tenant_id = $1 and pto_vta = $2 and cbte_tipo = $3
      returning ultimo_numero`,
    [tenantId, ptoVta, cbteTipo]
  );

  return Number(rows[0].ultimo_numero);
}

/**
 * Emite un comprobante y devuelve el CAE.
 *
 * Idempotente por `referencia`: si ya existe un comprobante autorizado para
 * esa referencia, lo devuelve sin volver a emitir.
 */
export async function emitir(opts: OpcionesEmision): Promise<ResultadoEmision> {
  const { pool, cred, tenant, cbteTipo, datos, referencia } = opts;
  const fecha = opts.fecha ?? fechaARCA();

  if (referencia) {
    const { rows } = await pool.query(
      `select numero, cae, cae_vto, estado
         from arca_comprobantes
        where tenant_id = $1 and referencia = $2 and estado = 'autorizado'`,
      [tenant.id, referencia]
    );
    if (rows[0]) {
      return {
        numero: Number(rows[0].numero),
        resultado: 'A',
        cae: rows[0].cae,
        caeVto: rows[0].cae_vto,
      };
    }
  }

  // El ticket se obtiene fuera de la transacción de emisión, porque tiene su
  // propio lock y no debe competir con el de numeración.
  const ta = await getTA(pool, cred, 'wsfe');

  const client = await pool.connect();
  let requestXml = '';

  try {
    await client.query('begin');
    await client.query("set local statement_timeout = '45s'");
    await client.query("set local lock_timeout = '10s'");

    const numero = await reservarNumero(client, tenant.id, tenant.ptoVta, cbteTipo);

    await client.query(
      `insert into arca_comprobantes
         (tenant_id, pto_vta, cbte_tipo, numero, estado, referencia,
          doc_tipo, doc_nro, cond_iva_receptor, importe_total, moneda, cotizacion)
       values ($1,$2,$3,$4,'pendiente',$5,$6,$7,$8,$9,$10,$11)`,
      [
        tenant.id,
        tenant.ptoVta,
        cbteTipo,
        numero,
        referencia ?? null,
        datos.docTipo,
        datos.docNro,
        datos.condIvaReceptor,
        datos.impTotal,
        datos.monId ?? 'PES',
        datos.monCotiz ?? 1,
      ]
    );

    const cuerpo = armarFECAESolicitar({
      ptoVta: tenant.ptoVta,
      cbteTipo,
      numero,
      fecha,
      datos,
    });

    const resp = await llamarWSFE<any>(
      'FECAESolicitar',
      cuerpo,
      ta,
      tenant.cuit,
      (xml) => {
        requestXml = xml;
      }
    );

    const det = resp?.FeDetResp?.FECAEDetResponse;
    const resultado = String(det?.Resultado ?? resp?.FeCabResp?.Resultado ?? 'R') as
      | 'A'
      | 'R'
      | 'P';

    const obsRaw = det?.Observaciones?.Obs;
    const observaciones = obsRaw
      ? (Array.isArray(obsRaw) ? obsRaw : [obsRaw]).map((o: any) => ({
          Code: Number(o.Code),
          Msg: String(o.Msg),
        }))
      : undefined;

    if (resultado !== 'A') {
      await client.query(
        `update arca_comprobantes
            set estado = 'rechazado', observaciones = $1, request_xml = $2,
                response_json = $3, updated_at = now()
          where tenant_id = $4 and pto_vta = $5 and cbte_tipo = $6 and numero = $7`,
        [
          JSON.stringify(observaciones ?? []),
          requestXml,
          JSON.stringify(resp),
          tenant.id,
          tenant.ptoVta,
          cbteTipo,
          numero,
        ]
      );
      await client.query('commit');

      return { numero, resultado, observaciones };
    }

    const cae = String(det.CAE);
    const caeVto = String(det.CAEFchVto);

    await client.query(
      `update arca_comprobantes
          set estado = 'autorizado', cae = $1,
              cae_vto = to_date($2, 'YYYYMMDD'),
              observaciones = $3, request_xml = $4, response_json = $5,
              updated_at = now()
        where tenant_id = $6 and pto_vta = $7 and cbte_tipo = $8 and numero = $9`,
      [
        cae,
        caeVto,
        JSON.stringify(observaciones ?? []),
        requestXml,
        JSON.stringify(resp),
        tenant.id,
        tenant.ptoVta,
        cbteTipo,
        numero,
      ]
    );

    await client.query('commit');

    return { numero, resultado: 'A', cae, caeVto, observaciones };
  } catch (e) {
    await client.query('rollback').catch(() => {});

    // 10018: ARCA ya tiene ese número autorizado. Pasó que una emisión
    // anterior obtuvo CAE pero se perdió la respuesta. Hay que reconciliar,
    // no reintentar.
    if (e instanceof ErrorWSFE && e.tieneCodigo(10018)) {
      throw new Error(
        `El comprobante ya fue autorizado por ARCA pero no quedó registrado localmente. ` +
          `Ejecutá reconciliar() para recuperar el CAE. Detalle: ${e.message}`
      );
    }

    throw e;
  } finally {
    client.release();
  }
}

/**
 * Sincroniza el contador local con el último número que ARCA tiene registrado.
 * Correr en el alta del tenant, y ante el error 10016.
 */
export async function sincronizarContador(
  pool: Pool,
  cred: Credenciales,
  tenant: ContextoTenant,
  cbteTipo: number
): Promise<number> {
  const ta = await getTA(pool, cred, 'wsfe');
  const { ultimoAutorizado } = await import('./wsfe');
  const ultimo = await ultimoAutorizado(ta, tenant.cuit, tenant.ptoVta, cbteTipo);

  await pool.query(
    `insert into arca_contadores (tenant_id, pto_vta, cbte_tipo, ultimo_numero)
     values ($1,$2,$3,$4)
     on conflict (tenant_id, pto_vta, cbte_tipo)
       do update set ultimo_numero = excluded.ultimo_numero`,
    [tenant.id, tenant.ptoVta, cbteTipo, ultimo]
  );

  return ultimo;
}

/** Guarda contra emisiones accidentales en producción durante el desarrollo. */
export function advertirSiEsProduccion(): void {
  if (esProduccion()) {
    console.warn(
      '[ARCA] Entorno PRODUCCIÓN. Cada emisión genera un comprobante fiscal real.'
    );
  }
}
