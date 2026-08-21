/**
 * Armado del XML de FECAESolicitar.
 *
 * La diferencia crítica está en el nodo Iva: los comprobantes de letra C se
 * omiten por completo. Incluirlo aunque sea vacío hace que ARCA rechace el
 * comprobante con el error 10071.
 */

import { esc } from './wsfe';
import {
  esComprobanteC,
  redondear,
  type DatosComprobante,
  type AlicuotaIva,
} from './tipos';

function nodoIva(iva: AlicuotaIva[]): string {
  const items = iva
    .map(
      (a) => `
          <ar:AlicIva>
            <ar:Id>${a.id}</ar:Id>
            <ar:BaseImp>${redondear(a.baseImp)}</ar:BaseImp>
            <ar:Importe>${redondear(a.importe)}</ar:Importe>
          </ar:AlicIva>`
    )
    .join('');

  return `
        <ar:Iva>${items}
        </ar:Iva>`;
}

function nodoCbtesAsoc(asoc: NonNullable<DatosComprobante['cbtesAsoc']>): string {
  const items = asoc
    .map(
      (c) => `
          <ar:CbteAsoc>
            <ar:Tipo>${c.tipo}</ar:Tipo>
            <ar:PtoVta>${c.ptoVta}</ar:PtoVta>
            <ar:Nro>${c.nro}</ar:Nro>${
              c.cuit ? `\n            <ar:Cuit>${c.cuit}</ar:Cuit>` : ''
            }
          </ar:CbteAsoc>`
    )
    .join('');

  return `
        <ar:CbtesAsoc>${items}
        </ar:CbtesAsoc>`;
}

/**
 * Valida la coherencia de importes antes de enviarlos.
 * Detectar el problema acá da un mensaje útil; detectarlo en ARCA da un 10064.
 */
export function validarImportes(d: DatosComprobante, cbteTipo: number): void {
  const c = esComprobanteC(cbteTipo);

  if (c) {
    if (d.iva && d.iva.length > 0) {
      throw new Error(
        `El comprobante tipo ${cbteTipo} es de letra C y no admite discriminación de IVA. Quitá el array iva.`
      );
    }
    if (redondear(d.impNeto) !== redondear(d.impTotal)) {
      throw new Error(
        `En un comprobante C, ImpNeto (${d.impNeto}) debe ser igual a ImpTotal (${d.impTotal})`
      );
    }
    return;
  }

  const impIVA = d.impIVA ?? 0;

  if (d.iva && d.iva.length > 0) {
    const suma = redondear(d.iva.reduce((acc, a) => acc + a.importe, 0));
    if (suma !== redondear(impIVA)) {
      throw new Error(
        `La suma de las alícuotas (${suma}) no coincide con ImpIVA (${impIVA})`
      );
    }
  }

  const calculado = redondear(
    d.impNeto + impIVA + (d.impTrib ?? 0) + (d.impOpEx ?? 0) + (d.impTotConc ?? 0)
  );

  if (calculado !== redondear(d.impTotal)) {
    throw new Error(
      `ImpTotal (${d.impTotal}) no coincide con la suma de los componentes (${calculado}). ` +
        'Calculá el IVA sobre el neto y derivá el total, en lugar de partir del total.'
    );
  }
}

/** Arma el cuerpo XML de FECAESolicitar para un comprobante. */
export function armarFECAESolicitar(params: {
  ptoVta: number;
  cbteTipo: number;
  numero: number;
  fecha: string;
  datos: DatosComprobante;
}): string {
  const { ptoVta, cbteTipo, numero, fecha, datos: d } = params;

  validarImportes(d, cbteTipo);

  const esC = esComprobanteC(cbteTipo);
  const requiereFechasServicio = d.concepto === 2 || d.concepto === 3;

  if (requiereFechasServicio && (!d.fchServDesde || !d.fchServHasta || !d.fchVtoPago)) {
    throw new Error(
      `El concepto ${d.concepto} requiere FchServDesde, FchServHasta y FchVtoPago`
    );
  }

  const fechasServicio = requiereFechasServicio
    ? `
        <ar:FchServDesde>${d.fchServDesde}</ar:FchServDesde>
        <ar:FchServHasta>${d.fchServHasta}</ar:FchServHasta>
        <ar:FchVtoPago>${d.fchVtoPago}</ar:FchVtoPago>`
    : '';

  return `
    <ar:FeCAEReq>
      <ar:FeCabReq>
        <ar:CantReg>1</ar:CantReg>
        <ar:PtoVta>${ptoVta}</ar:PtoVta>
        <ar:CbteTipo>${cbteTipo}</ar:CbteTipo>
      </ar:FeCabReq>
      <ar:FeDetReq>
        <ar:FECAEDetRequest>
        <ar:Concepto>${d.concepto}</ar:Concepto>
        <ar:DocTipo>${d.docTipo}</ar:DocTipo>
        <ar:DocNro>${d.docNro}</ar:DocNro>
        <ar:CbteDesde>${numero}</ar:CbteDesde>
        <ar:CbteHasta>${numero}</ar:CbteHasta>
        <ar:CbteFch>${fecha}</ar:CbteFch>
        <ar:ImpTotal>${redondear(d.impTotal)}</ar:ImpTotal>
        <ar:ImpTotConc>${redondear(d.impTotConc ?? 0)}</ar:ImpTotConc>
        <ar:ImpNeto>${redondear(d.impNeto)}</ar:ImpNeto>
        <ar:ImpOpEx>${redondear(d.impOpEx ?? 0)}</ar:ImpOpEx>
        <ar:ImpTrib>${redondear(d.impTrib ?? 0)}</ar:ImpTrib>
        <ar:ImpIVA>${redondear(d.impIVA ?? 0)}</ar:ImpIVA>${fechasServicio}
        <ar:MonId>${esc(d.monId ?? 'PES')}</ar:MonId>
        <ar:MonCotiz>${d.monCotiz ?? 1}</ar:MonCotiz>
        <ar:CondicionIVAReceptorId>${d.condIvaReceptor}</ar:CondicionIVAReceptorId>${
          d.cbtesAsoc?.length ? nodoCbtesAsoc(d.cbtesAsoc) : ''
        }${!esC && d.iva?.length ? nodoIva(d.iva) : ''}
        </ar:FECAEDetRequest>
      </ar:FeDetReq>
    </ar:FeCAEReq>`;
}
