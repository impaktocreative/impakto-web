/**
 * Cliente SOAP de WSFEv1.
 *
 * Se usa XML armado a mano en lugar de una librería SOAP porque el WSDL de
 * ARCA es pesado, cambia poco y las librerías genéricas agregan una capa de
 * fallos difícil de diagnosticar cuando el servidor responde mal.
 */

import { XMLParser } from 'fast-xml-parser';
import { getEndpoints, NS_WSFE, TIMEOUT_MS } from './config';
import type { TicketAcceso } from './wsaa';

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
});

export interface ErrorARCA {
  Code: number;
  Msg: string;
}

export class ErrorWSFE extends Error {
  constructor(
    public readonly errores: ErrorARCA[],
    public readonly metodo: string
  ) {
    super(
      `${metodo}: ${errores.map((e) => `[${e.Code}] ${e.Msg}`).join(' | ')}`
    );
    this.name = 'ErrorWSFE';
  }

  tieneCodigo(codigo: number): boolean {
    return this.errores.some((e) => Number(e.Code) === codigo);
  }
}

/** Escapa caracteres que romperían el XML. */
export function esc(v: string | number): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizarErrores(raw: unknown): ErrorARCA[] {
  if (!raw) return [];
  const err = (raw as { Err?: unknown }).Err ?? raw;
  const lista = Array.isArray(err) ? err : [err];
  return lista
    .filter(Boolean)
    .map((e) => ({ Code: Number((e as ErrorARCA).Code), Msg: String((e as ErrorARCA).Msg) }));
}

/**
 * Llama a un método de WSFEv1.
 *
 * @param metodo   Nombre del método, por ejemplo 'FECAESolicitar'
 * @param cuerpo   XML del cuerpo del método, sin el nodo Auth
 * @param ta       Ticket de acceso. Omitir solo para FEDummy.
 * @param cuit     CUIT representado, o sea el que factura
 * @param onRequest Callback opcional para persistir el XML enviado
 */
export async function llamarWSFE<T = unknown>(
  metodo: string,
  cuerpo = '',
  ta?: TicketAcceso,
  cuit?: number | string,
  onRequest?: (xml: string) => void
): Promise<T> {
  const auth = ta
    ? `
      <ar:Auth>
        <ar:Token>${ta.token}</ar:Token>
        <ar:Sign>${ta.sign}</ar:Sign>
        <ar:Cuit>${cuit}</ar:Cuit>
      </ar:Auth>`
    : '';

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="${NS_WSFE}">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:${metodo}>${auth}${cuerpo}</ar:${metodo}>
  </soapenv:Body>
</soapenv:Envelope>`;

  onRequest?.(envelope);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let texto: string;
  try {
    const res = await fetch(getEndpoints().wsfe, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: NS_WSFE + metodo,
      },
      body: envelope,
      signal: controller.signal,
    });
    texto = await res.text();
  } finally {
    clearTimeout(timer);
  }

  const parsed = parser.parse(texto);
  const fault = parsed?.Envelope?.Body?.Fault;

  if (fault) {
    throw new Error(
      `SOAP Fault en ${metodo}: ${fault.faultcode} ${fault.faultstring}`
    );
  }

  const result =
    parsed?.Envelope?.Body?.[`${metodo}Response`]?.[`${metodo}Result`];

  if (result === undefined) {
    throw new Error(
      `Respuesta inesperada de ${metodo}: ${texto.slice(0, 500)}`
    );
  }

  // ARCA devuelve errores dentro del Result, no como SOAP Fault.
  const errores = normalizarErrores((result as { Errors?: unknown }).Errors);
  if (errores.length > 0) {
    throw new ErrorWSFE(errores, metodo);
  }

  return result as T;
}

/** Health check. No requiere ticket. */
export async function feDummy(): Promise<{
  AppServer: string;
  DbServer: string;
  AuthServer: string;
}> {
  return llamarWSFE('FEDummy');
}

/** Último número autorizado por ARCA para ese punto de venta y tipo. */
export async function ultimoAutorizado(
  ta: TicketAcceso,
  cuit: number,
  ptoVta: number,
  cbteTipo: number
): Promise<number> {
  const r = await llamarWSFE<{ CbteNro: number }>(
    'FECompUltimoAutorizado',
    `<ar:PtoVta>${ptoVta}</ar:PtoVta><ar:CbteTipo>${cbteTipo}</ar:CbteTipo>`,
    ta,
    cuit
  );
  return Number(r.CbteNro);
}

/** Puntos de venta habilitados. Sirve para verificar el alta. */
export async function puntosDeVenta(ta: TicketAcceso, cuit: number) {
  const r = await llamarWSFE<{ ResultGet?: { PtoVenta?: unknown } }>(
    'FEParamGetPtosVenta',
    '',
    ta,
    cuit
  );
  const pv = r?.ResultGet?.PtoVenta;
  if (!pv) return [];
  return Array.isArray(pv) ? pv : [pv];
}
