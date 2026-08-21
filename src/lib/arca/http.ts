import 'server-only'
import https from 'node:https'
import { TIMEOUT_MS } from './config'
import { detalleDeRed } from './errores'

/**
 * POST de SOAP contra ARCA.
 *
 * No usa `fetch` por el handshake TLS. `servicios1.afip.gov.ar`, el servidor
 * de producción de WSFEv1, negocia Diffie-Hellman con parámetros de 1024
 * bits, y OpenSSL 3 los rechaza por debajo de 2048:
 *
 *   ERR_SSL_DH_KEY_TOO_SMALL — tls_process_ske_dhe: dh key too small
 *
 * La salida fácil sería bajar el nivel de seguridad con `@SECLEVEL=1`, que
 * hace pasar ese mismo DH débil. En vez de eso se le ofrecen al servidor
 * únicamente suites ECDHE: los cuatro endpoints de ARCA las soportan, el
 * intercambio de claves queda más fuerte que el que venía negociando y se
 * conserva forward secrecy.
 *
 * Verificado contra los cuatro: wsaa y wsfe, homologación y producción.
 */

const CIPHERS_ARCA = [
  'ECDHE-RSA-AES256-GCM-SHA384',
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'ECDHE-RSA-AES256-SHA384',
  'ECDHE-RSA-AES128-SHA256',
].join(':')

const agente = new https.Agent({
  keepAlive: true,
  ciphers: CIPHERS_ARCA,
  minVersion: 'TLSv1.2',
})

export function postSoap(url: string, cuerpo: string, soapAction: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const destino = new URL(url)

    const req = https.request(
      {
        agent: agente,
        host: destino.hostname,
        port: destino.port || 443,
        path: destino.pathname + destino.search,
        method: 'POST',
        timeout: TIMEOUT_MS,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: soapAction,
          'Content-Length': Buffer.byteLength(cuerpo),
        },
      },
      res => {
        const trozos: Buffer[] = []
        res.on('data', t => trozos.push(t))
        res.on('end', () => resolve(Buffer.concat(trozos).toString('utf8')))
      },
    )

    req.on('error', e => reject(new Error(`${url}: ${detalleDeRed(e)}`)))
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`${url}: sin respuesta después de ${TIMEOUT_MS / 1000} segundos`))
    })

    req.end(cuerpo)
  })
}
