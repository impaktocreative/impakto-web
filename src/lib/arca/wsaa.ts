/**
 * WSAA: autenticación contra ARCA.
 *
 * Arma el Ticket de Requerimiento de Acceso (TRA), lo firma en CMS con el
 * certificado y la clave privada, y lo intercambia por un Ticket de Acceso
 * válido por 12 horas.
 *
 * No llamar directo desde la aplicación. Usar getTA() de ta-cache.ts, que
 * evita pedir un ticket teniendo uno vigente.
 */

import 'server-only';
import forge from 'node-forge';
import { XMLParser } from 'fast-xml-parser';
import { endpoints, type Entorno } from './config';
import { postSoap } from './http';
import type { Credenciales } from './credenciales';

export interface TicketAcceso {
  token: string;
  sign: string;
  /** ISO 8601 con offset. */
  expira: string;
}

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

/**
 * Formatea una fecha en ISO 8601 con el offset REAL de la máquina.
 *
 * El error clásico es hacer toISOString() y concatenar '-03:00': eso toma la
 * hora UTC y la declara como hora argentina, produciendo una fecha tres horas
 * en el futuro. ARCA la rechaza con xml.generationTime.invalid.
 *
 * Este helper funciona igual en una máquina en Argentina, en México o en un
 * contenedor en UTC.
 */
export function isoConOffset(d: Date): string {
  const offsetMin = -d.getTimezoneOffset();
  const signo = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const p = (n: number) => String(Math.floor(n)).padStart(2, '0');

  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${signo}${p(abs / 60)}:${p(abs % 60)}`
  );
}

function crearTRA(servicio: string): string {
  const ahora = new Date();
  // Margen hacia atrás y hacia adelante para tolerar desfasajes de reloj.
  const desde = new Date(ahora.getTime() - 10 * 60 * 1000);
  const hasta = new Date(ahora.getTime() + 10 * 60 * 1000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(ahora.getTime() / 1000)}</uniqueId>
    <generationTime>${isoConOffset(desde)}</generationTime>
    <expirationTime>${isoConOffset(hasta)}</expirationTime>
  </header>
  <service>${servicio}</service>
</loginTicketRequest>`;
}

function firmarCMS(tra: string, certPem: string, keyPem: string): string {
  let certificado: forge.pki.Certificate;
  let clave: forge.pki.rsa.PrivateKey;

  try {
    certificado = forge.pki.certificateFromPem(certPem);
  } catch {
    throw new Error(
      'El certificado no es un PEM válido. Verificá que empiece con BEGIN CERTIFICATE y no con BEGIN CERTIFICATE REQUEST'
    );
  }

  try {
    clave = forge.pki.privateKeyFromPem(keyPem) as forge.pki.rsa.PrivateKey;
  } catch {
    throw new Error('La clave privada no es un PEM válido');
  }

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, 'utf8');
  p7.addCertificate(certificado);
  p7.addSigner({
    key: clave,
    certificate: certificado,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date().toISOString() },
    ],
  });
  p7.sign();

  return forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes());
}

/**
 * Pide un ticket nuevo a WSAA.
 *
 * Falla con coe.alreadyAuthenticated si ya hay uno vigente para esta
 * combinación de certificado y servicio. El cache es responsabilidad de
 * ta-cache.ts.
 */
export async function solicitarTA(
  cred: Credenciales,
  entorno: Entorno,
  servicio = 'wsfe'
): Promise<TicketAcceso> {
  const cms = firmarCMS(crearTRA(servicio), cred.cert, cred.key);

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  const url = endpoints(entorno).wsaa;
  let texto: string;
  try {
    texto = await postSoap(url, envelope, '');
  } catch (e) {
    throw new Error(`No se pudo conectar con WSAA. ${e instanceof Error ? e.message : String(e)}`);
  }

  const parsed = parser.parse(texto);
  const fault = parsed?.Envelope?.Body?.Fault;

  if (fault) {
    const code = String(fault.faultcode ?? '');
    const msg = String(fault.faultstring ?? 'Error desconocido de WSAA');

    if (code.includes('alreadyAuthenticated')) {
      throw new ErrorTicketVigente(msg);
    }
    throw new Error(`WSAA ${code}: ${msg}`);
  }

  const xmlTA = parsed?.Envelope?.Body?.loginCmsResponse?.loginCmsReturn;
  if (!xmlTA) {
    throw new Error(`Respuesta inesperada de WSAA: ${texto.slice(0, 500)}`);
  }

  const ta = parser.parse(xmlTA).loginTicketResponse;

  return {
    token: String(ta.credentials.token),
    sign: String(ta.credentials.sign),
    expira: String(ta.header.expirationTime),
  };
}

/**
 * Se lanza cuando ARCA rechaza el pedido porque ya hay un ticket vigente.
 * En producción indica que el cache no está funcionando.
 */
export class ErrorTicketVigente extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorTicketVigente';
  }
}
