/**
 * Código QR de la RG 4892.
 *
 * Obligatorio en los comprobantes electrónicos. Esta función devuelve la URL
 * que hay que codificar como QR con cualquier librería (qrcode, qr-image).
 */

export interface DatosQR {
  /** Fecha del comprobante en formato yyyy-mm-dd. */
  fecha: string;
  /** CUIT del emisor. */
  cuit: number;
  ptoVta: number;
  tipoCmp: number;
  nroCmp: number;
  importe: number;
  moneda?: string;
  ctz?: number;
  tipoDocRec?: number;
  nroDocRec?: number;
  /** Código de autorización, el CAE. */
  codAut: string | number;
}

const BASE = 'https://www.afip.gob.ar/fe/qr/?p=';

export function urlQR(d: DatosQR): string {
  const payload = {
    ver: 1,
    fecha: d.fecha,
    cuit: Number(d.cuit),
    ptoVta: Number(d.ptoVta),
    tipoCmp: Number(d.tipoCmp),
    nroCmp: Number(d.nroCmp),
    importe: Number(d.importe),
    moneda: d.moneda ?? 'PES',
    ctz: d.ctz ?? 1,
    tipoDocRec: d.tipoDocRec ?? 99,
    nroDocRec: d.nroDocRec ?? 0,
    tipoCodAut: 'E',
    codAut: Number(d.codAut),
  };

  return BASE + Buffer.from(JSON.stringify(payload)).toString('base64');
}

/** Convierte yyyymmdd (formato de ARCA) a yyyy-mm-dd (formato del QR). */
export function fechaParaQR(yyyymmdd: string | number): string {
  const s = String(yyyymmdd);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
