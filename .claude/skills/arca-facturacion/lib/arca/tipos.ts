/**
 * Tipos y tablas de códigos.
 *
 * Las tablas son referencia de lectura. La fuente de verdad son los métodos
 * FEParamGet* de WSFEv1, que hay que consultar en runtime y cachear porque
 * ARCA las modifica por resolución general.
 */

export type CondicionFiscal = 'monotributo' | 'responsable_inscripto' | 'exento';

/** Tipos de comprobante más usados. Verificar con FEParamGetTiposCbte. */
export const CBTE = {
  FACTURA_A: 1,
  NOTA_DEBITO_A: 2,
  NOTA_CREDITO_A: 3,
  FACTURA_B: 6,
  NOTA_DEBITO_B: 7,
  NOTA_CREDITO_B: 8,
  FACTURA_C: 11,
  NOTA_DEBITO_C: 12,
  NOTA_CREDITO_C: 13,
  RECIBO_C: 15,
} as const;

/** Tipos de documento del receptor. Verificar con FEParamGetTiposDoc. */
export const DOC = {
  CUIT: 80,
  CUIL: 86,
  DNI: 96,
  CONSUMIDOR_FINAL: 99,
} as const;

/**
 * Condición frente al IVA del receptor.
 * Obligatorio desde la RG 5616. Verificar con FEParamGetCondicionIvaReceptor.
 */
export const COND_IVA = {
  RESPONSABLE_INSCRIPTO: 1,
  EXENTO: 4,
  CONSUMIDOR_FINAL: 5,
  MONOTRIBUTO: 6,
  NO_CATEGORIZADO: 7,
  PROVEEDOR_EXTERIOR: 8,
  CLIENTE_EXTERIOR: 9,
  LIBERADO_19640: 10,
  MONOTRIBUTISTA_SOCIAL: 13,
  NO_ALCANZADO: 15,
} as const;

export const CONCEPTO = {
  PRODUCTOS: 1,
  SERVICIOS: 2,
  AMBOS: 3,
} as const;

/** Alícuotas de IVA. Verificar con FEParamGetTiposIva. */
export const IVA = {
  CERO: 3,
  DIEZ_CINCO: 4,
  VEINTIUNO: 5,
  VEINTISIETE: 6,
  CINCO: 8,
  DOS_CINCO: 9,
} as const;

export interface AlicuotaIva {
  /** Código de la tabla IVA. */
  id: number;
  /** Base imponible gravada a esta alícuota. */
  baseImp: number;
  /** Importe de IVA correspondiente. */
  importe: number;
}

export interface ComprobanteAsociado {
  tipo: number;
  ptoVta: number;
  nro: number;
  cuit?: number;
}

export interface DatosComprobante {
  concepto: number;
  docTipo: number;
  docNro: number;
  condIvaReceptor: number;
  /** Importe total, con dos decimales. */
  impTotal: number;
  impNeto: number;
  impIVA?: number;
  impTrib?: number;
  impOpEx?: number;
  impTotConc?: number;
  /** Obligatorias si concepto es 2 o 3. Formato yyyymmdd. */
  fchServDesde?: string;
  fchServHasta?: string;
  fchVtoPago?: string;
  monId?: string;
  monCotiz?: number;
  /** Omitir por completo en comprobantes C. */
  iva?: AlicuotaIva[];
  /** Obligatorio en notas de crédito y débito. */
  cbtesAsoc?: ComprobanteAsociado[];
}

export interface ResultadoEmision {
  numero: number;
  resultado: 'A' | 'R' | 'P';
  cae?: string;
  caeVto?: string;
  observaciones?: { Code: number; Msg: string }[];
}

/** Tipo de factura que corresponde emitir según la condición del emisor. */
export function tipoFacturaPara(condicion: CondicionFiscal): number {
  switch (condicion) {
    case 'monotributo':
    case 'exento':
      return CBTE.FACTURA_C;
    case 'responsable_inscripto':
      // La elección entre A y B depende del receptor, no del emisor.
      // Resolverla con tipoFacturaRI().
      return CBTE.FACTURA_B;
  }
}

/** Para emisores responsables inscriptos, el tipo depende del receptor. */
export function tipoFacturaRI(condIvaReceptor: number): number {
  return condIvaReceptor === COND_IVA.RESPONSABLE_INSCRIPTO
    ? CBTE.FACTURA_A
    : CBTE.FACTURA_B;
}

/** Nota de crédito que corresponde a un tipo de factura. */
export function notaCreditoPara(tipoFactura: number): number {
  const mapa: Record<number, number> = {
    [CBTE.FACTURA_A]: CBTE.NOTA_CREDITO_A,
    [CBTE.FACTURA_B]: CBTE.NOTA_CREDITO_B,
    [CBTE.FACTURA_C]: CBTE.NOTA_CREDITO_C,
  };
  const nc = mapa[tipoFactura];
  if (!nc) throw new Error(`Sin nota de crédito definida para el tipo ${tipoFactura}`);
  return nc;
}

/** Comprobantes de letra C, que no llevan discriminación de IVA. */
export function esComprobanteC(cbteTipo: number): boolean {
  return [CBTE.FACTURA_C, CBTE.NOTA_DEBITO_C, CBTE.NOTA_CREDITO_C, CBTE.RECIBO_C].includes(
    cbteTipo as 11 | 12 | 13 | 15
  );
}

/** Fecha en el formato yyyymmdd que exige ARCA. */
export function fechaARCA(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

/**
 * Redondeo a dos decimales trabajando en centavos.
 * Evita los desvíos que ARCA rechaza con el error 10064.
 */
export function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}
